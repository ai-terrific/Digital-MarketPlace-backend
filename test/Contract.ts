import {
  marketplace,
  marketplaceAddress,
  provider,
} from "../src/config/contract";

async function main() {
  const network = await provider.getNetwork();
  const code = await provider.getCode(marketplaceAddress);

  console.log("Network chain ID:", network.chainId.toString());
  console.log("Contract address:", marketplaceAddress);
  console.log("Contract bytecode exists:", code !== "0x");

  if (network.chainId !== 11155111n) {
    throw new Error("Wrong network: expected Sepolia (chain ID 11155111)");
  }

  if (code === "0x") {
    throw new Error("No contract bytecode found at this address");
  }

  // Read common public getters only if they exist in your actual ABI.
  if (marketplace.interface.hasFunction("owner")) {
    console.log("Contract owner:", await marketplace.owner());
  }

  if (marketplace.interface.hasFunction("paymentToken")) {
    console.log("PHX payment token:", await marketplace.paymentToken());
  }

  console.log("Connection test passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
