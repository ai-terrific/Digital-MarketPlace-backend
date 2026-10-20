import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof Error) {
    res.status(500).json({ message: err.message });
  }

  res.status(500).json({
    message: "Server error",
  });
};
