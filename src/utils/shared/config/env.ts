import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

export interface EnvConfig {
  PORT: number;
  NODE_ENV: "development" | "production" | "test";
}

const env: EnvConfig = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  NODE_ENV: (process.env.NODE_ENV as EnvConfig["NODE_ENV"]) || "development",
};

export function getEnv(): EnvConfig {
  return env;
}
