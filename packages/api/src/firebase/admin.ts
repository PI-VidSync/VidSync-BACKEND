import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// --- SOLUCIÓN QUIRÚRGICA ---
const getSanitizedKey = () => {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";

  // 1. Primero convertimos los \n literales en saltos reales
  let key = rawKey.replace(/\\n/g, "\n");

  // 2. EXTRACCIÓN CON REGEX (La Magia)
  // Busca estrictamente desde "-----BEGIN" hasta "-----END PRIVATE KEY-----"
  // e ignora cualquier cosa que esté antes o después (comillas extra, espacios, basura).
  const match = key.match(/-----BEGIN PRIVATE KEY-----[\s\S]+?-----END PRIVATE KEY-----/);

  if (match) {
    return match[0]; // Devolvemos solo la parte limpia y válida
  }

  // Si no encuentra el patrón, devolvemos la key original (aunque fallará)
  return key;
};

const privateKey = getSanitizedKey();

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
    console.log("✅ Firebase Admin inicializado correctamente.");
  } catch (error) {
    console.error("❌ Error inicializando Firebase:", error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;