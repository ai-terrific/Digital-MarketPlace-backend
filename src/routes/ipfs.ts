import express from "express";
import multer from "multer";
import { uploadIpfsImage } from "../controllers";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"));
  },
});

router.post("/upload", upload.single("image"), uploadIpfsImage);

export default router;
