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
      const uid = (req as any).uid;
      if (!uid) return res.status(400).json({ error: "Missing uid param" });

      const { email, firstName, lastName, age } = req.body;

      if (!email || !firstName || !lastName || !age) {
        return res.status(500).json({ error: "Missing data" })
      }

      // Update Firebase Auth user if needed
      const authUpdates = { email, displayName: `${firstName} ${lastName}` };

      if (Object.keys(authUpdates).length > 0) {
        await admin.auth().updateUser(uid, authUpdates);
      }

      // Update Firestore user doc
      const firestoreUpdates = { uid, firstName, lastName, email, updatedAt: admin.firestore.FieldValue.serverTimestamp() };

      // Check if user docs exist
      const userDoc = await admin.firestore().collection("users").doc(uid).get();

      if (!userDoc.exists) {
        await admin.firestore().collection("users").doc(uid).set({
          ...firestoreUpdates,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        res.json({ message: "User created in firestore", uid })
      } else {
        await admin.firestore().collection("users").doc(uid).update(firestoreUpdates);
        res.json({ message: "User updated", uid });
      }
    } catch (error: any) {
      // If user doesn't exist in auth, firebase-admin throws; surface a 404 where appropriate
      const msg = error?.code === "auth/user-not-found" ? "User not found" : error?.message;
      res.status(error?.code === "auth/user-not-found" ? 404 : 500).json({ error: msg });
    }
  }

  static async updatePassword(req: Request, res: Response) {
    try {
      const uid = (req as any).uid;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "oldPassword y newPassword son requeridos" });
      }

      const user = await admin.auth().getUser(uid);

      if (!user.email) {
        return res.status(400).json({ message: "El usuario no tiene email asociado" });
      }

      const apiKey = process.env.FIREBASE_API_KEY;

      const verifyPasswordUrl =
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

      const verifyResponse = await fetch(verifyPasswordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: oldPassword,
          returnSecureToken: false
        })
      })
        .then(response => response.json())
        .catch(() => null);

      if (verifyResponse.error) {
        return res.status(401).json({ message: "La contraseña actual es incorrecta" });
      }

      await admin.auth().updateUser(uid, {
        password: newPassword
      });

      return res.json({ message: "Contraseña actualizada correctamente" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al actualizar contraseña", error });
    }
  }

  /**
   * Delete a user from Auth and remove Firestore document
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const uid = (req as any).uid;
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
