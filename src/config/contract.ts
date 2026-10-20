import * as hre from "hardhat";
import "dotenv/config";
import { Contract, JsonRpcProvider, Wallet, getAddress } from "ethers";
import marketplaceArtifact from "../abi/DigitalMarketplace.json";
import * as keys from "./key";

const hardhatEthers =
  typeof hre !== "undefined" && "ethers" in hre ? (hre as any).ethers : undefined;

function requiredEnv(name: keyof typeof keys): any {
  const value = keys[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const provider =
  hardhatEthers?.provider
    ? hardhatEthers.provider
    : new JsonRpcProvider(
        process.env.RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com",
      );

export const marketplaceAddress = getAddress(
  requiredEnv("MARKETPLACE_CONTRACT_ADDRESS"),
);

export const backendWallet = new Wallet(requiredEnv("PRIVATE_KEY"), provider);

export const marketplace = new Contract(
  marketplaceAddress,
  marketplaceArtifact,
  backendWallet,
);
