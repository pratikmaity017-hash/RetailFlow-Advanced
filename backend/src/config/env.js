import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT || 5000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be between 1 and 65535.");
}

const nodeEnv = process.env.NODE_ENV || "development";

if (!["development", "production", "test"].includes(nodeEnv)) {
  throw new Error("NODE_ENV must be development, production, or test.");
}

const mongodbUri = process.env.MONGODB_URI?.trim() || null;
const coreApiBaseUrl = process.env.CORE_API_BASE_URL?.trim() || null;
const coreApiServiceKey = process.env.CORE_API_SERVICE_KEY?.trim() || null;

export const env = Object.freeze({
  nodeEnv,
  port,
  mongodbUri,
  coreApiBaseUrl,
  coreApiServiceKey,

  dependencies: Object.freeze({
    mongodbConfigured: Boolean(mongodbUri),
    coreApiConfigured: Boolean(coreApiBaseUrl),
    coreApiServiceConfigured: Boolean(coreApiServiceKey),
  }),
});

export function getMongoConfigStatus() {
  const uri = process.env.MONGODB_URI?.trim();

  return {
    configured: Boolean(uri),
    hasUsername: Boolean(
      uri &&
      uri.includes("@") &&
      uri.split("://")[1]?.split("@")[0]?.includes(":"),
    ),
    hasDatabaseName: Boolean(uri && uri.split(".net/")[1]?.split("?")[0]),
  };
}
