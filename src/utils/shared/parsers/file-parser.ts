export interface ParsedRecord {
  userId: number;
  userName: string;
  orderId: number;
  productId: number;
  productValue: number;
  purchaseDate: Date;
}

export class FileParser {
  static parseFixedWidthLine(line: string): ParsedRecord {
    if (line.length < 95) {
      throw new Error(
        `Invalid line length: ${line.length}, expected at least 95 characters`
      );
    }

    try {
      const userId = parseInt(line.substring(0, 10).trim(), 10);
      const userName = line.substring(10, 55).trim();
      const orderId = parseInt(line.substring(55, 65).trim(), 10);
      const productId = parseInt(line.substring(65, 75).trim(), 10);
      const productValue = parseFloat(line.substring(75, 87).trim());

      const dateString = line.substring(87, 95).trim();
      const year = parseInt(dateString.substring(0, 4), 10);
      const month = parseInt(dateString.substring(4, 6), 10) - 1;
      const day = parseInt(dateString.substring(6, 8), 10);
      const purchaseDate = new Date(year, month, day);

      if (isNaN(userId) || userId <= 0)
        throw new Error(`Invalid user ID: ${userId}`);
      if (!userName) throw new Error("User name is required");
      if (isNaN(orderId) || orderId <= 0)
        throw new Error(`Invalid order ID: ${orderId}`);
      if (isNaN(productId) || productId <= 0)
        throw new Error(`Invalid product ID: ${productId}`);
      if (isNaN(productValue) || productValue <= 0)
        throw new Error(`Invalid product value: ${productValue}`);
      if (isNaN(purchaseDate.getTime()))
        throw new Error(`Invalid purchase date: ${dateString}`);

      return {
        userId,
        userName,
        orderId,
        productId,
        productValue,
        purchaseDate,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Error parsing line: "${line.trim()}". ${error.message}`
        );
      } else {
        throw new Error(
          `Error parsing line: "${line.trim()}". Unknown error occurred.`
        );
      }
    }
  }
}
