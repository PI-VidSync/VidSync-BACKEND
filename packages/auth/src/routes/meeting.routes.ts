import { Router } from "express";
import { createMeeting } from "../controllers/meeting.controller";

const router = Router();

// Verificamos que createMeeting no sea undefined (Debug)
if (!createMeeting) {
  console.error("❌ ERROR CRÍTICO: El controlador createMeeting no se cargó.");
}

router.post("/", createMeeting);

export default router;