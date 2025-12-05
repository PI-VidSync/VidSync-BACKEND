import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", (req, res) => {
    res.json({ message: "VidSync API" });
});

router.post("/register", AuthController.register);
router.post("/verify-token", AuthController.verifyToken);
router.get("/profile", requireAuth, AuthController.getProfile);
router.put("/update", requireAuth, AuthController.updateUser);
router.put("/update-password", requireAuth, AuthController.updatePassword);
router.delete("/delete", requireAuth, AuthController.deleteUser);

export default router;
