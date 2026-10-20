import type { Request, Response, NextFunction } from "express";
import { verifyMessage, getAddress } from "ethers";

export interface AuthenticatedRequest extends Request {
  user?: {
    walletAddress: string;
  };
}

// Demo in-memory challenge store.
// For production, use Redis or a database with expiration.
const challenges = new Map<string, { message: string; expiresAt: number }>();

// Request a fresh challenge for a wallet.
export function createWalletChallenge(walletAddress: string) {
  const address = getAddress(walletAddress);
  const nonce = crypto.randomUUID();
  const issuedAt = new Date();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  const message = [
    "Sign in to Phoenix Digital Marketplace",
    `Wallet: ${address}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt.toISOString()}`,
    `Expiration Time: ${new Date(expiresAt).toISOString()}`,
  ].join("\n");

  challenges.set(address.toLowerCase(), {
    message,
    expiresAt,
  });

  return message;
}

// Verify a signature and create an authenticated request identity.
export async function requireWalletAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { walletAddress, signature } = req.body ?? {};
    console.log(req.body);

    if (typeof walletAddress !== "string" || typeof signature !== "string") {
      return res.status(401).json({
        success: false,
        message: "Wallet address and signature are required",
      });
    }

    const address = getAddress(walletAddress);
    const key = address.toLowerCase();
    const challenge = challenges.get(key);

    if (!challenge || challenge.expiresAt < Date.now()) {
      challenges.delete(key);

      return res.status(401).json({
        success: false,
        message: "Challenge missing or expired. Request a new challenge.",
      });
    }

    const recoveredAddress = getAddress(
      verifyMessage(challenge.message, signature),
    );

    if (recoveredAddress !== address) {
      return res.status(401).json({
        success: false,
        message: "Invalid wallet signature",
      });
    }

    // Single-use challenge: prevent replay.
    challenges.delete(key);

    req.user = {
      walletAddress: address,
    };

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Wallet authentication failed",
    });
  }
}
