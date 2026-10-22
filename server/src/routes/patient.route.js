import { Router } from "express";
import {
  getPatients,
  updatePatient,
  deletePatient,
} from "../controllers/patient.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  updatePatientSchema,
  patientListSchema,
  patientIdParamSchema,
} from "../validation/patient.validation.js";

const router = Router();

router.get("/", validate(patientListSchema), getPatients);

router
  .route("/:id")
  .put(verifyJWT, validate(updatePatientSchema), updatePatient)
  .delete(verifyJWT, validate(patientIdParamSchema), deletePatient);

export default router;
