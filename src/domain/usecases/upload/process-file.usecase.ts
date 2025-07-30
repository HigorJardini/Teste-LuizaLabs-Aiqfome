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
        number,
        {
          orderId: number;
          userId: number;
          date: Date;
          total: number;
        }
      >();

      for (const line of lines) {
        try {
          const record = FileParser.parseFixedWidthLine(line);
          processedRecords.push(record);

          if (!usersMap.has(record.userId)) {
            usersMap.set(record.userId, record.userName);
          }

          if (!ordersMap.has(record.orderId)) {
            ordersMap.set(record.orderId, {
              orderId: record.orderId,
              userId: record.userId,
              date: record.purchaseDate,
              total: record.productValue,
            });
          } else {
            const order = ordersMap.get(record.orderId)!;
            order.total += record.productValue;
            ordersMap.set(record.orderId, order);
          }
        } catch (error) {
          console.error(`Error processing line: ${line}`, error);
        }
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
      for (const order of ordersMap.values()) {
        try {
          console.log(`Creating order with ID: ${order.orderId}`);

          const existingOrder = await this.orderRepository.findById(
            order.orderId
          );
          if (existingOrder) {
            console.log(`Order ${order.orderId} already exists, skipping`);
            continue;
          }

          await this.orderRepository.create({
            order_id: order.orderId,
            purchase_date: order.date,
            total: order.total,
            user_id: order.userId,
            upload_id: uploadId,
          });
        } catch (error) {
          console.error(`Error creating order ${order.orderId}:`, error);
          throw new Error(
            `Failed to create order with ID ${order.orderId}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      console.log("Verifying orders were created successfully...");
      for (const order of ordersMap.values()) {
        const createdOrder = await this.orderRepository.findById(order.orderId);
        if (!createdOrder) {
          throw new Error(
            `Order ${order.orderId} was not created successfully.`
          );
        }
      }

      console.log("Creating products...");
      const BATCH_SIZE = 100;
      const productEntities = processedRecords.map((record) => ({
        product_id: record.productId,
        value: record.productValue,
        order_id: record.orderId,
      }));

      let savedProductsCount = 0;
      for (let i = 0; i < productEntities.length; i += BATCH_SIZE) {
        const batch = productEntities.slice(i, i + BATCH_SIZE);
        console.log(
          `Processing product batch ${i / BATCH_SIZE + 1}/${Math.ceil(productEntities.length / BATCH_SIZE)}`
        );
        const savedBatch = await this.productRepository.createMany(batch);
        savedProductsCount += savedBatch.length;
      }

      console.log(`Successfully saved ${savedProductsCount} products`);

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
