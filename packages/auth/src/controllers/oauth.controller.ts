import { Request, Response } from "express";
import admin from "../firebase/admin";
import { db } from "../firebase/admin";

export const oauthLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        ok: false,
        message: "El idToken es requerido",
      });
    }

    // 1. Verificar token del proveedor OAuth (Google, GitHub, etc.)
    const decoded = await admin.auth().verifyIdToken(idToken);

    // 2. Referencia al usuario en Firestore
    const userRef = db.collection("users").doc(decoded.uid);
    const userSnap = await userRef.get();

    // 3. Obtener datos relevantes del token
    const provider = decoded.firebase?.sign_in_provider || "unknown";

    const userData = {
      uid: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || "",
      picture: decoded.picture || "",
      provider,
      updatedAt: new Date(),
    };

    // 4. Crear usuario si no existe
    if (!userSnap.exists) {
      await userRef.set({
        ...userData,
        createdAt: new Date(),
      });
    } else {
      await userRef.update(userData);
    }

    // 5. Respuesta
    return res.status(200).json({
      ok: true,
      user: {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        provider,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};
