import env from "env-var";
import dotenv from "dotenv";

dotenv.config();

export const envs = {
  JWT_SECRET: env.get("JWT_SECRET").required().asString(),
  PORT: env.get("PORT").required().asPortNumber(),
  POSTGRES_DB_HOST: env.get("DB_HOST").required().asString(),
  POSTGRES_DB_PORT: env.get("DB_PORT").required().asPortNumber(),
  POSTGRES_DB_USER: env.get("DB_USER").required().asString(),
  POSTGRES_DB_NAME: env.get("DB_NAME").required().asString(),
};
