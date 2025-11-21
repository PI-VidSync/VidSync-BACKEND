import { Request, Response } from "express";
import admin from "../firebase/admin";

export class AuthController {
  /**
   * Register a new user with email and password.
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, age } = req.body;

      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });

      await admin.firestore().collection("users").doc(userRecord.uid).set({
        uid: userRecord.uid,
        email,
        firstName,
        lastName,
        age,
        provider: "password",
        role: "user",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(201).json({
        message: "User created",
        uid: userRecord.uid,
      });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

    /**
   * Validate ID Token from frontend (email/password or social login)
   */
  static async verifyToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Missing token" });

      const decoded = await admin.auth().verifyIdToken(token);
      res.json(decoded);

    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  }

    static async getProfile(req: Request, res: Response) {
    try {
      const uid = (req as any).uid;

      const userDoc = await admin.firestore()
        .collection("users")
        .doc(uid)
        .get();

      res.json(userDoc.data());

    } catch (error) {
      res.status(500).json({ error: "Error fetching profile" });
    }
  }
}
