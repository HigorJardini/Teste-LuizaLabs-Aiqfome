import {
  UploadRepository,
  OrderRepository,
  ProductRepository,
  UserRepository,
} from "@repositories-entities";
import { FileUploadDTO, UploadResponseDTO } from "@dtos";
import { FileParser, ParsedRecord } from "@parsers/file-parser";

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
      const usersMap = new Map<number, string>();

      const ordersMap = new Map<
        string,
        {
          orderId: number;
          userId: number;
          date: Date;
          total: number;
          products: Array<{ productId: number; value: number }>;
        }
      >();

      for (const line of lines) {
        try {
          const record = FileParser.parseFixedWidthLine(line);
          processedRecords.push(record);

          if (!usersMap.has(record.userId)) {
            usersMap.set(record.userId, record.userName);
          }

          const orderKey = `${record.orderId}_${record.userId}`;

          if (!ordersMap.has(orderKey)) {
            ordersMap.set(orderKey, {
              orderId: record.orderId,
              userId: record.userId,
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
      for (const [userId, userName] of usersMap.entries()) {
        try {
          console.log(`Processing user ID: ${userId}, Name: ${userName}`);
          const existingUser = await this.userRepository.findById(userId);

          if (!existingUser) {
            console.log(`Creating new user with ID: ${userId}`);
            await this.userRepository.create({
              user_id: userId,
              name: userName,
            });
          } else {
            console.log(`User ID: ${userId} already exists`);
          }
        } catch (error) {
          console.error(`Error creating/updating user ${userId}:`, error);
          throw new Error(
            `Failed to create user with ID ${userId}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      console.log("Verifying all users exist before creating orders...");
      for (const [userId] of usersMap.entries()) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
          throw new Error(
            `User with ID ${userId} could not be found after creation attempt. Cannot proceed with orders.`
          );
        }
      }

      console.log("Modifying Orders table to accept specific IDs...");
      try {
        await this.orderRepository.modifyOrdersTable();
      } catch (error) {
        console.error("Error modifying Orders table:", error);
      }

      console.log("Creating orders...");
      const failedOrders = [];

      for (const [orderKey, order] of ordersMap.entries()) {
        try {
          console.log(
            `Creating order with ID: ${order.orderId} for user ${order.userId}`
          );

          const existingOrder = await this.orderRepository.findByIdAndUserId(
            order.orderId,
            order.userId
          );

          if (existingOrder) {
            console.log(
              `Order ${order.orderId} for user ${order.userId} already exists, skipping`
            );
            continue;
          }

          try {
            await this.orderRepository.create({
              order_id: order.orderId,
              purchase_date: order.date,
              total: order.total,
              user_id: order.userId,
              upload_id: uploadId,
            });

            const verifyOrder = await this.orderRepository.findByIdAndUserId(
              order.orderId,
              order.userId
            );

            if (!verifyOrder) {
              console.warn(
                `Order ${order.orderId} for user ${order.userId} was not found immediately after creation. Will retry later.`
              );
            }
          } catch (dbError) {
            console.error(
              `Database error creating order ${order.orderId}:`,
              dbError
            );
            failedOrders.push({
              orderId: order.orderId,
              userId: order.userId,
              error:
                dbError instanceof Error ? dbError.message : "Unknown error",
            });
            continue;
          }
        } catch (error) {
          console.error(
            `Error in order creation process for ${order.orderId}/${order.userId}:`,
            error
          );
          failedOrders.push({
            orderId: order.orderId,
            userId: order.userId,
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
      const allProducts: { value: number; order_id: number }[] = [];

      for (const [orderKey, order] of ordersMap.entries()) {
        const orderExists = await this.orderRepository.findById(order.orderId);
        if (!orderExists) {
          console.warn(
            `Order ${order.orderId} not found, skipping its products`
          );
          continue;
        }

        for (const product of order.products) {
          allProducts.push({
            value: product.value,
            order_id: order.orderId,
          });
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

      // Recalcular o total dos pedidos com base nos produtos
      console.log("Updating order totals based on products...");
      const updatedOrderIds = new Set<number>();

      // Coletar todos os IDs de pedidos que receberam produtos
      for (const product of allProducts) {
        updatedOrderIds.add(product.order_id);
      }

      console.log(`Recalculating totals for ${updatedOrderIds.size} orders...`);

      // Atualizar cada pedido com o total correto
      for (const orderId of updatedOrderIds) {
        try {
          // Buscar todos os produtos do pedido
          const products = await this.productRepository.findByOrderId(orderId);

          // Calcular o total correto somando os valores de todos os produtos
          const total = products.reduce(
            (sum, product) => sum + Number(product.value),
            0
          );

          // Atualizar o pedido com o total correto
          await this.orderRepository.updateTotal(orderId, total);

          console.log(
            `Updated order ${orderId} total to ${total} based on ${products.length} products`
          );
        } catch (error) {
          console.error(`Error updating total for order ${orderId}:`, error);
        }
      }

      const sampleOrderIds = Array.from(ordersMap.keys()).slice(0, 5);
      for (const orderId of sampleOrderIds) {
        const products = await this.productRepository.findByOrderId(
          Number(orderId)
        );
        console.log(
          `Order ${orderId} has ${products.length} products after import`
        );
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
