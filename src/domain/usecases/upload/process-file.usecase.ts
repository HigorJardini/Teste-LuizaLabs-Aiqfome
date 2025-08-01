import {
  UploadRepository,
  OrderRepository,
  ProductRepository,
  UserRepository,
} from "@repositories-entities";
import { FileUploadDTO, UploadResponseDTO } from "@dtos";
import { FileParser, ParsedRecord } from "@parsers/file-parser";
import { ProductEntity } from "@entities";

export class ProcessFileUseCase {
  constructor(
    private uploadRepository: UploadRepository,
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private userRepository: UserRepository
  ) {}

  async execute(
    file: FileUploadDTO,
    login_id: number
  ): Promise<UploadResponseDTO> {
    try {
      console.log("Starting file processing...");

      const upload = await this.uploadRepository.create({
        login_id,
        filename: file.filename,
      });

      const uploadId = upload.upload_id!;
      console.log(`Created upload record with ID: ${uploadId}`);

      const content = file.buffer.toString("utf-8");
      const lines = content.split("\n").filter((line) => line.trim() !== "");
      console.log(`Processing ${lines.length} lines from file`);

      const processedRecords: ParsedRecord[] = [];

      const usersMap = new Map<string, { userId: number; userName: string }>();

      const ordersMap = new Map<
        string,
        {
          orderId: number;
          userId: number;
          userName: string;
          date: Date;
          total: number;
          products: Array<{ productId: number; value: number }>;
        }
      >();

      for (const line of lines) {
        try {
          const record = FileParser.parseFixedWidthLine(line);
          processedRecords.push(record);

          const userKey = `${record.userId}_${record.userName}`;
          if (!usersMap.has(userKey)) {
            usersMap.set(userKey, {
              userId: record.userId,
              userName: record.userName,
            });
          }

          const orderKey = `${record.orderId}_${record.userId}_${record.userName}`;

          if (!ordersMap.has(orderKey)) {
            ordersMap.set(orderKey, {
              orderId: record.orderId,
              userId: record.userId,
              userName: record.userName,
              date: record.purchaseDate,
              total: record.productValue,
              products: [
                { productId: record.productId, value: record.productValue },
              ],
            });
          } else {
            const order = ordersMap.get(orderKey)!;
            order.total += record.productValue;
            order.products.push({
              productId: record.productId,
              value: record.productValue,
            });
            ordersMap.set(orderKey, order);
          }
        } catch (error) {
          console.error(`Error processing line: ${line}`, error);
        }
      }

      console.log("Sample of parsed records:");
      console.log(processedRecords.slice(0, 3));

      console.log("Sample of orders map:");
      let i = 0;
      for (const [key, order] of ordersMap.entries()) {
        console.log(`Order ${key}:`, order);
        if (++i >= 3) break;
      }

      console.log(`Found ${usersMap.size} unique users`);
      console.log(`Found ${ordersMap.size} unique orders`);

      console.log("Creating users...");
      for (const [userKey, userInfo] of usersMap.entries()) {
        try {
          console.log(
            `Processing user ID: ${userInfo.userId}, Name: ${userInfo.userName}`
          );
          const existingUser = await this.userRepository.findByUserId(
            userInfo.userId,
            userInfo.userName
          );

          if (!existingUser) {
            console.log(
              `Creating new user with ID: ${userInfo.userId}, Name: ${userInfo.userName}`
            );
            await this.userRepository.create({
              user_id: userInfo.userId,
              name: userInfo.userName,
            });
          } else {
            console.log(
              `User ID: ${userInfo.userId}, Name: ${userInfo.userName} already exists`
            );
          }
        } catch (error) {
          console.error(
            `Error creating/updating user ${userInfo.userId}/${userInfo.userName}:`,
            error
          );
          throw new Error(
            `Failed to create user with ID ${userInfo.userId}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      console.log("Verifying all users exist before creating orders...");
      for (const [userKey, userInfo] of usersMap.entries()) {
        const user = await this.userRepository.findByUserId(
          userInfo.userId,
          userInfo.userName
        );

        if (!user) {
          throw new Error(
            `User with ID ${userInfo.userId} and Name ${userInfo.userName} could not be found after creation attempt. Cannot proceed with orders.`
          );
        }
      }

      console.log("Creating orders...");
      const failedOrders = [];
      const createdOrders = new Map<
        string,
        { id: number; order_id: number; user_id: number }
      >();

      for (const [orderKey, order] of ordersMap.entries()) {
        try {
          console.log(
            `Creating order with ID: ${order.orderId} for user ${order.userId}/${order.userName}`
          );

          const user = await this.userRepository.findByUserId(
            order.userId,
            order.userName
          );

          if (!user || !user.id) {
            console.warn(
              `User with business ID ${order.userId} and name "${order.userName}" not found, skipping order`
            );
            continue;
          }

          const existingOrder =
            await this.orderRepository.findByOrderIdAndUserTableId(
              order.orderId,
              user.id
            );

          if (existingOrder) {
            console.log(
              `Order ${order.orderId} for user ${order.userId}/${order.userName} already exists, using existing`
            );
            createdOrders.set(orderKey, {
              id: existingOrder.id!,
              order_id: existingOrder.order_id,
              user_id: order.userId,
            });
            continue;
          }

          try {
            const createdOrder = await this.orderRepository.create({
              order_id: order.orderId,
              purchase_date: order.date,
              total: order.total,
              user_table_id: user.id,
              upload_id: uploadId,
            });

            console.log(
              `Created order with internal ID: ${createdOrder.id} for business order ID: ${order.orderId}`
            );

            createdOrders.set(orderKey, {
              id: createdOrder.id!,
              order_id: createdOrder.order_id,
              user_id: order.userId,
            });
          } catch (dbError) {
            console.error(
              `Database error creating order ${order.orderId}:`,
              dbError
            );
            failedOrders.push({
              orderId: order.orderId,
              userId: order.userId,
              userName: order.userName,
              error:
                dbError instanceof Error ? dbError.message : "Unknown error",
            });
            continue;
          }
        } catch (error) {
          console.error(
            `Error in order creation process for ${order.orderId}/${order.userId}/${order.userName}:`,
            error
          );
          failedOrders.push({
            orderId: order.orderId,
            userId: order.userId,
            userName: order.userName,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      if (failedOrders.length > 0) {
        console.warn(
          `Failed to create ${failedOrders.length} orders:`,
          failedOrders
        );
      }

      console.log("Allowing database time to complete all operations...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Creating products with simplified approach...");
      const allProducts: ProductEntity[] = [];

      for (const [orderKey, order] of ordersMap.entries()) {
        if (createdOrders.has(orderKey)) {
          const orderInfo = createdOrders.get(orderKey)!;

          for (const product of order.products) {
            allProducts.push({
              product_id: product.productId,
              value: product.value,
              order_table_id: orderInfo.id,
            });
          }
        } else {
          console.warn(
            `Order key ${orderKey} not found in created orders, skipping its products`
          );
        }
      }

      console.log(`Processing ${allProducts.length} total products`);

      const BATCH_SIZE = 50;
      let savedCount = 0;

      for (let i = 0; i < allProducts.length; i += BATCH_SIZE) {
        const batch = allProducts.slice(i, i + BATCH_SIZE);
        console.log(
          `Creating batch ${Math.floor(i / BATCH_SIZE) + 1} with ${batch.length} products`
        );

        try {
          for (const product of batch) {
            await this.productRepository.create(product);
            savedCount++;

            if (savedCount % 10 === 0) {
              console.log(
                `Created ${savedCount}/${allProducts.length} products so far`
              );
            }
          }
        } catch (error) {
          console.error(
            `Error with product batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
            error
          );
        }

        if (i + BATCH_SIZE < allProducts.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log(
        `Successfully created ${savedCount} products out of ${allProducts.length}`
      );

      console.log("Updating order totals based on products...");
      const updatedOrders = new Set<number>();

      for (const product of allProducts) {
        if (product.order_table_id) {
          updatedOrders.add(product.order_table_id);
        }
      }

      console.log(`Recalculating totals for ${updatedOrders.size} orders...`);

      for (const orderId of updatedOrders) {
        try {
          const products =
            await this.productRepository.findByOrderTableId(orderId);

          const total = products.reduce(
            (sum, product) => sum + Number(product.value),
            0
          );

          await this.orderRepository.updateTotal(orderId, total);

          console.log(
            `Updated order with internal ID ${orderId} total to ${total} based on ${products.length} products`
          );
        } catch (error) {
          console.error(
            `Error updating total for order with internal ID ${orderId}:`,
            error
          );
        }
      }

      return {
        upload_id: uploadId,
        filename: file.filename,
        uploaded_at: upload.uploaded_at!,
        processed_records: processedRecords.length,
      };
    } catch (error) {
      console.error("Error in ProcessFileUseCase:", error);
      throw error;
    }
  }
}
