import { Request, Response, NextFunction } from "express";
import admin from "../firebase/admin";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "No token provided" });

    const token = header.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    (req as any).uid = decoded.uid;
    next();

  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
