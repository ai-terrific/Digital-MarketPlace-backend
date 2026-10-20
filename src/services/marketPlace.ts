import { marketplace, marketplaceAddress, provider } from "../config/contract";

import marketPlaceArtifact from "../abi/DigitalMarketplace.json";
import { getAddress, Interface, parseUnits } from "ethers";
import { PHX_TOKEN_DECIMALS } from "../config/key";

const abiInterface = new Interface(marketPlaceArtifact);

export async function createOnChainProduct(
  sellerAddress: string,
  name: string,
  description: string,
  priceInPHX: string,
  imageURI: string,
) {
  const seller = getAddress(sellerAddress);
  const decimals = Number(PHX_TOKEN_DECIMALS);
  const price = parseUnits(priceInPHX, decimals);

  if (price <= 0n) {
    throw new Error("Price must be greater than zero");
  }

  const createProductSignature =
    "createProduct(address,string,string,uint256,string)";
  if (!marketplace.interface.hasFunction(createProductSignature)) {
    throw new Error(
      "The deployed ABI does not contain the expected createProduct function",
    );
  }

  const tx = await marketplace.getFunction(createProductSignature)(
    seller,
    name,
    description,
    price,
    imageURI,
  );

  const receipt = await tx.wait();

  if (!receipt || receipt.status !== 1) {
    throw new Error("Product creation transaction failed");
  }

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== marketplaceAddress.toLowerCase()) {
      continue;
    }

    try {
      const event = abiInterface.parseLog({
        topics: [...log.topics],
        data: log.data,
      });

      if (
        event?.name === "ProductCreated" &&
        getAddress(event.args.productOwner) === seller
      ) {
        return {
          productId: event.args.productId.toString(),
          sellerAddress: seller,
          price: price.toString(),
          transactionHash: receipt.hash,
        };
      }
    } catch {
      // Ignore logs that don't match this event.
    }
  }

  throw new Error(
    `Transaction ${receipt.hash} succeeded, but the expected ProductCreated event was not found. Check the deployed ABI and event signature.`,
  );
}
