import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyFirebaseToken } from './middleware/verifyToken';
import { auth } from './firebaseAdmin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

/**
 * Health check
 * @route GET /health
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth' });
});

/**
 * Verifica el token del usuario
 * @route GET /verify
 */
app.get('/verify', verifyFirebaseToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: (req as any).user 
  });
});

/**
 * Obtiene información del usuario
 * @route GET /user/:uid
 */
app.get('/user/:uid', verifyFirebaseToken, async (req, res) => {
  try {
    const userRecord = await auth.getUser(req.params.uid);
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      providers: userRecord.providerData
    });
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});