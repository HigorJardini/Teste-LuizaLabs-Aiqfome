import { AppDataSource } from "../src/infrastructure/repositories/connection/pg";

beforeAll(async () => {
  if (
    process.env.NODE_ENV === "test" &&
    process.env.TEST_TYPE === "integration"
  ) {
    try {
      await AppDataSource.initialize();
      console.log("Database connected for tests");

      await AppDataSource.query("TRUNCATE TABLE products CASCADE");
      await AppDataSource.query("TRUNCATE TABLE orders CASCADE");
      await AppDataSource.query("TRUNCATE TABLE users CASCADE");
      await AppDataSource.query("TRUNCATE TABLE uploads CASCADE");
    } catch (error) {
      console.error("Error connecting to database for tests:", error);
    }
  }
});

afterAll(async () => {
  if (
    process.env.NODE_ENV === "test" &&
    process.env.TEST_TYPE === "integration"
  ) {
    await AppDataSource.destroy();
    console.log("Database connection closed after tests");
  }
});

afterEach(async () => {
  if (
    process.env.NODE_ENV === "test" &&
    process.env.TEST_TYPE === "integration"
  ) {
    try {
      await AppDataSource.query("DELETE FROM products");
      await AppDataSource.query("DELETE FROM orders");
      await AppDataSource.query("DELETE FROM users");
      await AppDataSource.query("DELETE FROM uploads");
    } catch (error) {
      console.error("Error cleaning database after test:", error);
    }
  }
});

jest.setTimeout(30000);
