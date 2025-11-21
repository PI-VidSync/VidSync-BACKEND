import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/register", AuthController.register);
router.post("/verify-token", AuthController.verifyToken);

router.get("/profile", requireAuth, AuthController.getProfile);

export default router;
