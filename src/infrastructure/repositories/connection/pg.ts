import { DataSource } from "typeorm";
import { getEnv } from "@config/env";
import {
  UserTypeORMEntity,
  OrderTypeORMEntity,
  ProductTypeORMEntity,
  UploadTypeORMEntity,
  UserLoginTypeORMEntity,
} from "@database-entities";

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = getEnv();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: false,
  logging: true,
  entities: [
    UserTypeORMEntity,
    OrderTypeORMEntity,
    ProductTypeORMEntity,
    UploadTypeORMEntity,
    UserLoginTypeORMEntity,
  ],
  migrations: ["src/infrastructure/database/migrations/**/*.ts"],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database initialized");
  } catch (error) {
    console.error("Error initializing database", error);
    throw error;
  }
};
