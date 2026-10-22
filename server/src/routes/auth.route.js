import { Router } from "express";

import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validation/auth.validation.js";

const router = Router();

router.post("/login", validate(loginSchema), loginUser);
router.post("/refresh", refreshAccessToken);

// Protected
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);

export default router;