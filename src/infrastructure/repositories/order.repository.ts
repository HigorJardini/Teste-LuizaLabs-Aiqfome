import { OrderRepository } from "@repositories-entities";
import { OrderEntity } from "@entities";
import { OrderFiltersDTO } from "@dtos";
import { AppDataSource } from "@database-connection";
import { OrderTypeORMEntity } from "@database-entities";
import { Between } from "typeorm";

export class TypeORMOrderRepository implements OrderRepository {
  private repository = AppDataSource.getRepository(OrderTypeORMEntity);

  async create(order: OrderEntity): Promise<OrderEntity> {
    try {
      if (order.order_id) {
        console.log(`Creating order with specific ID: ${order.order_id}`);

        const existingOrder = await this.findById(order.order_id);
        if (existingOrder) {
          console.log(`Order with ID ${order.order_id} already exists`);
          return existingOrder;
        }

        await this.repository.query(
          `INSERT INTO orders (order_id, purchase_date, total, user_id, upload_id) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (order_id) DO UPDATE 
           SET purchase_date = $2, total = $3, user_id = $4, upload_id = $5`,
          [
            order.order_id,
            order.purchase_date,
            order.total,
            order.user_id,
            order.upload_id,
          ]
        );

        return order;
      }

      const newOrder = this.repository.create(order);
      const savedOrder = await this.repository.save(newOrder);
      return {
        ...savedOrder,
        purchase_date: savedOrder.purchase_date ?? new Date(),
        total: order.total ?? 0,
        user_id: order.user_id ?? 0,
        upload_id: order.upload_id ?? 0,
      };
    } catch (error) {
      console.error(`Error creating order:`, error);
      throw error;
    }
  }

  async modifyOrdersTable(): Promise<void> {
    try {
      await this.repository.query(`
        -- Criar sequência para orders se não existir
        CREATE SEQUENCE IF NOT EXISTS orders_order_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
            
        -- Alterar a coluna order_id para usar a sequência como padrão apenas se necessário
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_attribute 
                WHERE attrelid = 'orders'::regclass 
                AND attname = 'order_id' 
                AND atthasdef = true
            ) THEN
                ALTER TABLE orders ALTER COLUMN order_id SET DEFAULT nextval('orders_order_id_seq'::regclass);
            END IF;
        END
        $$;
      `);
      console.log("Orders table modified to accept specific IDs");
    } catch (error) {
      console.error("Error modifying orders table:", error);
      throw error;
    }
  }

  async findById(order_id: number): Promise<OrderEntity | null> {
    try {
      console.log(`Finding order with ID: ${order_id}`);
      const order = await this.repository.findOne({
        where: { order_id },
        relations: {
          user: true,
          products: true,
        },
      });

      if (!order) {
        console.log(`Order with ID ${order_id} not found`);
        return null;
      }

      return {
        order_id: order.order_id,
        purchase_date: order.purchase_date ?? new Date(),
        total: order.total ?? 0,
        user_id: order.user_id ?? 0,
        upload_id: order.upload_id ?? 0,
      };
    } catch (error) {
      console.error(`Error finding order by ID ${order_id}:`, error);
      throw error;
    }
  }

  async findAll(
    filters: OrderFiltersDTO
  ): Promise<{ orders: OrderEntity[]; count: number }> {
    const {
      order_id,
      start_date,
      end_date,
      user_id,
      page = 1,
      limit = 10,
    } = filters;

    const whereClause: any = {};

    if (order_id) {
      whereClause.order_id = order_id;
    }

    if (user_id) {
      whereClause.user_id = user_id;
    }

    if (start_date && end_date) {
      whereClause.purchase_date = Between(
        new Date(start_date),
        new Date(end_date)
      );
    } else if (start_date) {
      whereClause.purchase_date = Between(
        new Date(start_date),
        new Date(new Date().setHours(23, 59, 59, 999)) // Hoje até 23:59:59
      );
    } else if (end_date) {
      whereClause.purchase_date = Between(new Date(0), new Date(end_date));
    }

    const [orders, count] = await this.repository.findAndCount({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        purchase_date: "DESC",
      },
      relations: {
        user: true,
        products: true,
      },
    });

    return {
      orders: orders.map((order) => ({
        order_id: order.order_id,
        purchase_date: order.purchase_date ?? new Date(),
        total: order.total ?? 0,
        user_id: order.user_id ?? 0,
        upload_id: order.upload_id ?? 0,
        user: order.user
          ? {
              user_id: order.user.user_id,
              name: order.user.name,
            }
          : undefined,
        products: order.products
          ? order.products.map((product) => ({
              product_id: product.product_id,
              value: product.value,
            }))
          : [],
      })),
      count,
    };
  }

  async createMany(orders: OrderEntity[]): Promise<OrderEntity[]> {
    const savedOrders: OrderEntity[] = [];

    await AppDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        for (const order of orders) {
          if (order.order_id) {
            const existingOrder = await transactionalEntityManager.findOne(
              OrderTypeORMEntity,
              {
                where: { order_id: order.order_id },
                relations: {
                  user: true,
                  products: true,
                },
              }
            );

            if (existingOrder) {
              savedOrders.push({
                order_id: existingOrder.order_id,
                purchase_date: existingOrder.purchase_date ?? new Date(),
                total: existingOrder.total ?? 0,
                user_id: existingOrder.user_id ?? 0,
                upload_id: existingOrder.upload_id ?? 0,
              });
              continue;
            }
          }

          const newOrder = transactionalEntityManager.create(
            OrderTypeORMEntity,
            order
          );
          const savedOrder = await transactionalEntityManager.save(newOrder);

          const completeOrder = await transactionalEntityManager.findOne(
            OrderTypeORMEntity,
            {
              where: { order_id: savedOrder.order_id },
              relations: {
                user: true,
                products: true,
              },
            }
          );

          savedOrders.push({
            order_id: savedOrder.order_id,
            purchase_date: savedOrder.purchase_date ?? new Date(),
            total: savedOrder.total ?? 0,
            user_id: savedOrder.user_id ?? 0,
            upload_id: savedOrder.upload_id ?? 0,
          });
        }
      }
    );

    return savedOrders;
  }

  async findByIdAndUserId(
    order_id: number,
    user_id: number
  ): Promise<OrderEntity | null> {
    try {
      console.log(`Finding order with ID: ${order_id} for user: ${user_id}`);
      const order = await this.repository.findOne({
        where: {
          order_id,
          user_id,
        },
        relations: {
          user: true,
          products: true,
        },
      });

      if (!order) {
        console.log(`Order with ID ${order_id} for user ${user_id} not found`);
        return null;
      }

      return {
        order_id: order.order_id,
        purchase_date: order.purchase_date ?? new Date(),
        total: order.total ?? 0,
        user_id: order.user_id ?? 0,
        upload_id: order.upload_id ?? 0,
      };
    } catch (error) {
      console.error(
        `Error finding order by ID ${order_id} and user ID ${user_id}:`,
        error
      );
      throw error;
    }
  }

  async updateTotal(order_id: number, total: number): Promise<void> {
    try {
      await this.repository.update({ order_id }, { total });
      console.log(`Updated order ${order_id} total to ${total}`);
    } catch (error) {
      console.error(`Error updating total for order ${order_id}:`, error);
      throw error;
    }
  }
}
