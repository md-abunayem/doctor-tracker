import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { dashboardStatsSchema } from "../validation/dashboard.validation.js";

const router = Router();

router
  .route("/stats")
  .get(verifyJWT, validate(dashboardStatsSchema), getDashboardStats);

export default router;
