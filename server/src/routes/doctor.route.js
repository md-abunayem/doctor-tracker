import { Router } from "express";
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
  addPatientToDoctor,
} from "../controllers/doctor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createDoctorSchema,
  updateDoctorSchema,
  getDoctorsSchema,
  doctorIdParamSchema,
  doctorIdSchema,
  doctorPatientsSchema,
} from "../validation/doctor.validation.js";
import { patientSchema } from "../validation/patient.validation.js";

const router = Router();


router
  .route("/")
  .post(verifyJWT, validate(createDoctorSchema), createDoctor)
  .get(verifyJWT, validate(getDoctorsSchema), getAllDoctors);
router
  .route("/:id")
  .get(verifyJWT, validate(doctorIdSchema), getDoctorById)
  .put(verifyJWT, validate(updateDoctorSchema), updateDoctor)
  .delete(verifyJWT, validate(doctorIdSchema), deleteDoctor);
router
  .route("/:doctorId/patients")
  .get(verifyJWT, validate(doctorPatientsSchema), getDoctorPatients)
  .post(
    verifyJWT,
    validate(doctorIdParamSchema.extend({ body: patientSchema })),
    addPatientToDoctor,
  );

export default router;
