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
      console.log(
        `Creating order with business ID: ${order.order_id} for user table ID: ${order.user_table_id}`
      );

      const existingOrder = await this.findByOrderIdAndUserTableId(
        order.order_id,
        order.user_table_id
      );

      if (existingOrder) {
        console.log(
          `Order with business ID ${order.order_id} for user table ID ${order.user_table_id} already exists`
        );
        return existingOrder;
      }

      const newOrder = this.repository.create({
        order_id: order.order_id,
        purchase_date: order.purchase_date,
        total: order.total,
        user_table_id: order.user_table_id,
        upload_id: order.upload_id,
      });

      const savedOrder = await this.repository.save(newOrder);

      return {
        id: savedOrder.id,
        order_id: savedOrder.order_id!,
        purchase_date: savedOrder.purchase_date ?? new Date(),
        total: savedOrder.total ?? 0,
        user_table_id: savedOrder.user_table_id!,
        upload_id: savedOrder.upload_id!,
      };
    } catch (error) {
      console.error(`Error creating order:`, error);
      throw error;
    }
  }

  async modifyOrdersTable(): Promise<void> {
    try {
      console.log(
        "Orders table already has proper structure with id as primary key"
      );
    } catch (error) {
      console.error("Error modifying orders table:", error);
      throw error;
    }
  }

  async findById(id: number): Promise<OrderEntity | null> {
    try {
      console.log(`Finding order with internal ID: ${id}`);
      const order = await this.repository.findOne({
        where: { id },
        relations: {
          user: true,
          products: true,
        },
      });

      if (!order) {
        console.log(`Order with internal ID ${id} not found`);
        return null;
      }

      return {
        id: order.id,
        order_id: order.order_id!,
        purchase_date: order.purchase_date ?? new Date(),
        total: order.total ?? 0,
        user_table_id: order.user_table_id!,
        upload_id: order.upload_id!,
        user: order.user
          ? {
              id: order.user.id,
              user_id: order.user.user_id!,
              name: order.user.name!,
            }
          : undefined,
        products: order.products?.map((p) => ({
          id: p.id,
          product_id: p.product_id!,
          value: p.value!,
          order_table_id: p.order_table_id,
        })),
      };
    } catch (error) {
      console.error(`Error finding order by ID ${id}:`, error);
      throw error;
    }
  }

  async findByOrderId(order_id: number): Promise<OrderEntity | null> {
    try {
      console.log(`Finding first order with business ID: ${order_id}`);
      const order = await this.repository.findOne({
        where: { order_id },
        relations: {
          user: true,
          products: true,
        },
      });

      if (!order) {
        console.log(`Order with business ID ${order_id} not found`);
        return null;
      }

      return {
        id: order.id,
        order_id: order.order_id!,
        purchase_date: order.purchase_date ?? new Date(),
        total: order.total ?? 0,
        user_table_id: order.user_table_id!,
        upload_id: order.upload_id!,
        user: order.user
          ? {
              id: order.user.id,
              user_id: order.user.user_id!,
              name: order.user.name!,
            }
          : undefined,
        products: order.products?.map((p) => ({
          id: p.id,
          product_id: p.product_id!,
          value: p.value!,
          order_table_id: p.order_table_id,
        })),
      };
    } catch (error) {
      console.error(`Error finding order by business ID ${order_id}:`, error);
      throw error;
    }
  }

  async findByOrderIdAndUserTableId(
    order_id: number,
    user_table_id: number
  ): Promise<OrderEntity | null> {
    try {
      console.log(
        `Finding order with business ID: ${order_id} for user table ID: ${user_table_id}`
      );
      const order = await this.repository.findOne({
        where: {
          order_id,
          user_table_id,
        },
        relations: {
          user: true,
          products: true,
        },
      });

      if (!order) {
        console.log(
          `Order with business ID ${order_id} for user table ID ${user_table_id} not found`
        );
        return null;
      }

      return {
        id: order.id,
        order_id: order.order_id!,
        purchase_date: order.purchase_date ?? new Date(),
        total: order.total ?? 0,
        user_table_id: order.user_table_id!,
        upload_id: order.upload_id!,
        user: order.user
          ? {
              id: order.user.id,
              user_id: order.user.user_id!,
              name: order.user.name!,
            }
          : undefined,
        products: order.products?.map((p) => ({
          id: p.id,
          product_id: p.product_id!,
          value: p.value!,
          order_table_id: p.order_table_id,
        })),
      };
    } catch (error) {
      console.error(
        `Error finding order by business ID ${order_id} and user table ID ${user_table_id}:`,
        error
      );
      throw error;
    }
  }

  async findAll(
    filters: OrderFiltersDTO
  ): Promise<{ orders: OrderEntity[]; count: number }> {
    try {
      console.log(`Finding orders with filters:`, filters);
      const {
        order_id,
        user_id,
        start_date,
        end_date,
        page = 1,
        limit = 10,
      } = filters;

      let queryBuilder = this.repository
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.user", "user")
        .leftJoinAndSelect("order.products", "products");

      if (order_id) {
        queryBuilder = queryBuilder.andWhere("order.order_id = :order_id", {
          order_id,
        });
      }

      if (user_id) {
        queryBuilder = queryBuilder.andWhere("user.user_id = :user_id", {
          user_id,
        });
      }

      if (start_date && end_date) {
        queryBuilder = queryBuilder.andWhere(
          "order.purchase_date BETWEEN :start_date AND :end_date",
          {
            start_date: new Date(start_date),
            end_date: new Date(end_date),
          }
        );
      } else if (start_date) {
        queryBuilder = queryBuilder.andWhere(
          "order.purchase_date >= :start_date",
          {
            start_date: new Date(start_date),
          }
        );
      } else if (end_date) {
        queryBuilder = queryBuilder.andWhere(
          "order.purchase_date <= :end_date",
          {
            end_date: new Date(end_date),
          }
        );
      }

      const [orders, count] = await queryBuilder
        .orderBy("order.purchase_date", "DESC")
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      console.log(
        `Found ${count} orders, returning page ${page} with ${orders.length} items`
      );

      return {
        orders: orders.map((order) => ({
          id: order.id,
          order_id: order.order_id!,
          purchase_date: order.purchase_date ?? new Date(),
          total: order.total ?? 0,
          user_table_id: order.user_table_id!,
          upload_id: order.upload_id!,
          user: order.user
            ? {
                id: order.user.id,
                user_id: order.user.user_id!,
                name: order.user.name!,
              }
            : undefined,
          products: order.products?.map((p) => ({
            id: p.id,
            product_id: p.product_id!,
            value: p.value!,
            order_table_id: p.order_table_id,
          })),
        })),
        count,
      };
    } catch (error) {
      console.error("Error finding orders:", error);
      return { orders: [], count: 0 };
    }
  }

  async createMany(orders: OrderEntity[]): Promise<OrderEntity[]> {
    const savedOrders: OrderEntity[] = [];

    await AppDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        for (const order of orders) {
          const existingOrder = await transactionalEntityManager.findOne(
            OrderTypeORMEntity,
            {
              where: {
                order_id: order.order_id,
                user_table_id: order.user_table_id,
              },
              relations: {
                user: true,
                products: true,
              },
            }
          );

          if (existingOrder) {
            savedOrders.push({
              id: existingOrder.id,
              order_id: existingOrder.order_id!,
              purchase_date: existingOrder.purchase_date ?? new Date(),
              total: existingOrder.total ?? 0,
              user_table_id: existingOrder.user_table_id!,
              upload_id: existingOrder.upload_id!,
            });
            continue;
          }

          const newOrder = transactionalEntityManager.create(
            OrderTypeORMEntity,
            {
              order_id: order.order_id,
              purchase_date: order.purchase_date,
              total: order.total,
              user_table_id: order.user_table_id,
              upload_id: order.upload_id,
            }
          );

          const savedOrder = await transactionalEntityManager.save(newOrder);

          savedOrders.push({
            id: savedOrder.id,
            order_id: savedOrder.order_id!,
            purchase_date: savedOrder.purchase_date ?? new Date(),
            total: savedOrder.total ?? 0,
            user_table_id: savedOrder.user_table_id!,
            upload_id: savedOrder.upload_id!,
          });
        }
      }
    );

    return savedOrders;
  }

  async updateTotal(id: number, total: number): Promise<void> {
    try {
      await this.repository.update({ id }, { total });
      console.log(`Updated order with internal ID ${id} total to ${total}`);
    } catch (error) {
      console.error(
        `Error updating total for order with internal ID ${id}:`,
        error
      );
      throw error;
    }
  }
}
