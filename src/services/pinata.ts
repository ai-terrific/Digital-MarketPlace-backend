import pinataSDK from "@pinata/sdk";
import { Readable } from "node:stream";
import { PINATA_API_KEY, PINATA_API_SECRET } from "../config/key";

const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

export async function uploadImage(
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  const stream = Readable.from(buffer);
  const options = {
    pinataMetadata: {
      name: originalName,
    },
  };
  const result = await pinata.pinFileToIPFS(stream, options);
  return `ipfs://${result.IpfsHash}`;
}
