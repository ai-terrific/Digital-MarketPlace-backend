import type { Request, Response } from "express";
import { uploadImage } from "../services/pinata";

export const uploadIpfsImage = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "An image file is required" });
  }

  try {
    const url = await uploadImage(file.buffer, file.originalname);
    console.log(url);

    return res.status(201).json({ url });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Image upload failed",
    });
  }
};
