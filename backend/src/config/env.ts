import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["JWT_SECRET", "MONGODB_URI"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.warn(`Environment variable ${key} is not set.`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGODB_URI ?? "",
  clientOrigins: (process.env.CLIENT_ORIGINS ?? "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET ?? "development-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
};

