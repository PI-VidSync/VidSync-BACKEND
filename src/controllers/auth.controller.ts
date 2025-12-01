import { Request, Response } from "express";
import admin from "../firebase/admin";

export class AuthController {
  /**
   * Register a new user with email and password.
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, age } = req.body;

      if (!email || !password || !firstName || !lastName || !age) {
        return res.status(400).json({ error: "Missing required fields" });
      }

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
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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

  /**
   * Update a user (auth + firestore).
   * Allowed updates: email, password, displayName, firstName, lastName, age, role
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const uid = req.params.uid;
      if (!uid) return res.status(400).json({ error: "Missing uid param" });

      const { email, password, displayName, firstName, lastName, age, role } = req.body;

      // Update Firebase Auth user if needed
      const authUpdates: any = {};
      if (email) authUpdates.email = email;
      if (password) authUpdates.password = password;
      if (displayName) authUpdates.displayName = displayName;

      if (Object.keys(authUpdates).length > 0) {
        await admin.auth().updateUser(uid, authUpdates);
      }

      // Update Firestore user doc
      const firestoreUpdates: any = {};
      if (firstName !== undefined) firestoreUpdates.firstName = firstName;
      if (lastName !== undefined) firestoreUpdates.lastName = lastName;
      if (age !== undefined) firestoreUpdates.age = age;
      if (role !== undefined) firestoreUpdates.role = role;
      if (email !== undefined) firestoreUpdates.email = email;
      if (displayName !== undefined) firestoreUpdates.displayName = displayName;
      firestoreUpdates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      if (Object.keys(firestoreUpdates).length > 0) {
        await admin.firestore().collection("users").doc(uid).update(firestoreUpdates);
      }

      res.json({ message: "User updated", uid });
    } catch (error: any) {
      // If user doesn't exist in auth, firebase-admin throws; surface a 404 where appropriate
      const msg = error?.code === "auth/user-not-found" ? "User not found" : error?.message;
      res.status(error?.code === "auth/user-not-found" ? 404 : 500).json({ error: msg });
    }
  }

  /**
   * Delete a user from Auth and remove Firestore document
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const uid = req.params.uid;
      if (!uid) return res.status(400).json({ error: "Missing uid param" });

      await admin.auth().deleteUser(uid);
      await admin.firestore().collection("users").doc(uid).delete();

      res.json({ message: "User deleted", uid });
    } catch (error: any) {
      const msg = error?.code === "auth/user-not-found" ? "User not found" : error?.message;
      res.status(error?.code === "auth/user-not-found" ? 404 : 500).json({ error: msg });
    }
  }
}
