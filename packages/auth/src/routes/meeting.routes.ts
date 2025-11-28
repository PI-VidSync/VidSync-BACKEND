import { Router } from "express";
import { 
  createMeeting, 
  getUserMeetings, 
  getMeetingByCode,
  updateMeeting, 
  deleteMeeting 
} from "../controllers/meeting.controller";
// Sugerencia: Importa tu middleware de auth si quieres proteger las rutas
// import { requireAuth } from "../middleware/requireAuth"; 

const router = Router();


// RUTAS DE REUNOONES

//1. Crea una nueva reunión
router.post("/", createMeeting);

//2. Obtiene todas las reuniones de un usuario (Host)
router.get("/user/:uid", getUserMeetings);

//3. Obtiene datos de una reunión por su código público (para unirse)
router.get("/join/:code", getMeetingByCode);

//4. Actualiza título o estado de una reunión
router.put("/:id", updateMeeting);

//5. Elimina una reunión
router.delete("/:id", deleteMeeting);

export default router;