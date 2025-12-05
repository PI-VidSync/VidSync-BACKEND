/**
 * @file firebase.admin.ts
 * @description Configura e inicializa Firebase Admin SDK usando variables de entorno.
 * Incluye una función para sanitizar la clave privada, corrigiendo problemas comunes
 * como saltos de línea escapados o contenido adicional inesperado.
 */

import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

/**
 * Obtiene y sanea la clave privada usada por Firebase Admin.
 *
 * Algunos proveedores de hosting o pipelines insertan caracteres extra,
 * escapan saltos de línea como "\\n" o envuelven la clave en comillas,
 * lo que hace que Firebase falle al inicializarse.
 *
 * Esta función:
 * 1. Toma la clave desde process.env.
 * 2. Reemplaza "\n" por saltos reales.
 * 3. Usa una expresión regular para extraer *únicamente* la sección válida del certificado,
 *    desde `-----BEGIN PRIVATE KEY-----` hasta `-----END PRIVATE KEY-----`.
 *
 * Si no encuentra el patrón esperado, devuelve la key sin modificar,
 * aunque normalmente esta fallará en la inicialización.
 *
 * @function getSanitizedKey
 * @returns {string} La clave privada corregida y utilizable por Firebase Admin.
 *
 * @example
 * // Ejemplo de variable de entorno problemática:
 * FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nABC123...\\n-----END PRIVATE KEY-----\\n"
 */
const getSanitizedKey = () => {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";

  // 1. Primero convertimos los \n literales en saltos reales
  let key = rawKey.replace(/\\n/g, "\n");

  // 2. EXTRACCIÓN CON REGEX (La Magia)
  const match = key.match(/-----BEGIN PRIVATE KEY-----[\s\S]+?-----END PRIVATE KEY-----/);

  if (match) {
    return match[0]; // Devolvemos solo la parte limpia y válida
  }

  // Si no encuentra el patrón, devolvemos la key original (aunque fallará)
  return key;
};

// Clave privada lista para usar
const privateKey = getSanitizedKey();

/**
 * Inicializa Firebase Admin si la aplicación aún no fue creada.
 * Esto previene errores en entornos donde el código se ejecuta múltiples veces
 * (como funciones serverless, hot reload, testing, etc.).
 *
 * @example
 * // No necesitas inicializar nada manualmente:
 * import { db, auth } from "./firebase.admin";
 */
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

/**
 * Instancia de Firestore inicializada por Firebase Admin.
 * @constant
 */
export const db = admin.firestore();

/**
 * Instancia del servicio de autenticación de Firebase Admin.
 * @constant
 */
export const auth = admin.auth();

/**
 * Exportación por defecto de toda la instancia de Firebase Admin.
 */
export default admin;