import type { Request, Response } from "express";
import Product from "../models/Product";
import { isAddress } from "ethers";
import { uploadImage } from "../services/pinata";
import { createOnChainProduct } from "../services/marketPlace";

//list product
export const listProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price } = req.body;
    const file = req.file;

    // Replace this with your real authentication middleware.
    // Never trust a seller address supplied only in req.body.
    const sellerAddress = (
      req as Request & { body?: { walletAddress?: string } }
    ).body?.walletAddress;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof price !== "string" ||
      !/^\d+(\.\d+)?$/.test(price) ||
      typeof sellerAddress !== "string" ||
      !isAddress(sellerAddress) ||
      !file
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product data, unauthenticated seller, or missing image",
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be positive",
      });
    }

    // 1. Upload the image to IPFS.
    const imageURI = await uploadImage(file.buffer, file.originalname);

    // 2. Create the on-chain record.
    const chainResult = await createOnChainProduct(
      sellerAddress,
      name.trim(),
      description.trim(),
      price,
      imageURI,
    );

    // 3. Save metadata in MongoDB.
    const product = await Product.create({
      productId: chainResult.productId,
      name: name.trim(),
      description: description.trim(),
      price: chainResult.price,
      sellerAddress: chainResult.sellerAddress,
      imageURI,
      txHash: chainResult.transactionHash,
    });

    return res.status(201).json({
      success: true,
      message: "Product listed successfully",
      product,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
