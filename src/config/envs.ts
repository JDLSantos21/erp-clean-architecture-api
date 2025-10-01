import env from "env-var";
import dotenv from "dotenv";

dotenv.config();

export const envs = {
  // App
  NODE_ENV: env.get("NODE_ENV").default("development").asString(),
  PORT: env.get("PORT").required().asPortNumber(),

  // Security
  JWT_SECRET: env.get("JWT_SECRET").required().asString(),

  // Database
  POSTGRES_DB_HOST: env.get("DB_HOST").required().asString(),
  POSTGRES_DB_PORT: env.get("DB_PORT").required().asPortNumber(),
  POSTGRES_DB_USER: env.get("DB_USER").required().asString(),
  POSTGRES_DB_NAME: env.get("DB_NAME").required().asString(),

  // Logging
  LOG_LEVEL: env.get("LOG_LEVEL").default("info").asString(),
  ENABLE_FILE_LOGGING: env.get("ENABLE_FILE_LOGGING").default("true").asBool(),
};
