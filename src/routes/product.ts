import express from "express";
import { listProduct } from "../controllers";
import multer from "multer";
import { requireWalletAuth } from "../middlewares/requireWalletAuth";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 10MB
});

//list product
router.post("/list", upload.single("image"), listProduct);

export default router;
