import express, { type Request, type Response } from "express";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    res.json("Server works!");
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch geolocation data" });
  }
});

export default router;
