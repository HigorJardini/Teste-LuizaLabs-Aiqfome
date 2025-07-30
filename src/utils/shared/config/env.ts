import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

export interface EnvConfig {
  PORT: number;
  NODE_ENV: "development" | "production" | "test";
  DB_HOST: string;
  DB_PORT: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_SECRET: string;
  UPLOAD_FILE_SIZE_LIMIT: number; // em bytes
  UPLOAD_MAX_FILES: number;
  UPLOAD_FIELD_SIZE: number;
}

const env: EnvConfig = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  NODE_ENV: (process.env.NODE_ENV as EnvConfig["NODE_ENV"]) || "development",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || "5432",
  DB_USERNAME: process.env.DB_USERNAME || "user",
  DB_PASSWORD: process.env.DB_PASSWORD || "password",
  DB_NAME: process.env.DB_NAME || "database",
  JWT_SECRET: process.env.JWT_SECRET || "jwt_secret",
  UPLOAD_FILE_SIZE_LIMIT: parseInt(
    process.env.UPLOAD_FILE_SIZE_LIMIT || String(5 * 1024 * 1024)
  ), // 5MB
  UPLOAD_MAX_FILES: parseInt(process.env.UPLOAD_MAX_FILES || "10"),
  UPLOAD_FIELD_SIZE: parseInt(process.env.UPLOAD_FIELD_SIZE || "100"),
};

export function getEnv(): EnvConfig {
  return env;
}
