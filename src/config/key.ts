import "dotenv/config";
import crypto from "crypto";

export const JWT_SECRET = process.env.JWT_SECRET || "harrysocialdev";
export const SECRET_KEY = process.env.SECRET_KEY || "harrydevsilversky";
export const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://harrysharkan602_db_user:YFieQFeNqMAEf4RP@cluster0.5aw0tpc.mongodb.net";
export const FRONTEND_URI =
  process.env.FRONTEND_URI || "http://172.20.5.112:3000";
export const PORT = process.env.PORT || 8001;
export const LogLevel = process.env.LOG_LEVEL || "debug";
export const PINATA_API_KEY =
  process.env.PINATA_API_KEY || "your_pinata_api_key";
export const PINATA_API_SECRET =
  process.env.PINATA_API_SECRET || "your_pinata_api_secret";
export const RPC_URL =
  process.env.RPC_URL ||
  "https://eth-mainnet.g.alchemy.com/v2/alch_iUYnjy1E9YPVLyme9Wplu";
export const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "29d8acc82514cd96456c89b7e4f31800c9435845e546247daf6675405e60a6e9";
export const MARKETPLACE_CONTRACT_ADDRESS =
  process.env.MARKETPLACE_CONTRACT_ADDRESS ||
  "0x1AeBF1E78B0EbaAaB38A7F1B6E2c6bD0D51880c6";
export const PHX_TOKEN_DECIMALS = process.env.PHX_TOKEN_DECIMALS || 18;
