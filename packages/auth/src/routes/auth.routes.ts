import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/register", AuthController.register);
router.post("/verify-token", AuthController.verifyToken);

router.get("/profile", requireAuth, AuthController.getProfile);

// new endpoints
// router.put("/update/:uid", requireAuth, AuthController.updateUser);
// router.delete("/delete/:uid", requireAuth, AuthController.deleteUser);
router.put("/update/:uid", AuthController.updateUser);
router.delete("/delete/:uid", AuthController.deleteUser);

export default router;
