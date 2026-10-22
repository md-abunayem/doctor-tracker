import { Doctor } from "../models/doctor.model.js";
import { Patient } from "../models/patient.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildDateRangeFilter } from "../utils/dateRange.js";
import { getPagination, getPaginationData } from "../utils/pagination.js";

const getPatients = asyncHandler(async (req, res) => {
  const { search, condition, doctor, from, to, ...paging } =
    req.validatedQuery ?? req.query;
  const { page, limit, skip } = getPagination(paging);

  const filter = {};
  if (search) {
    filter.$text = { $search: search };
  }
  if (condition) {
    filter.condition = condition;
  }
  if (doctor) {
    filter.doctor = doctor;
  }

  const createdAt = buildDateRangeFilter(from, to);
  if (createdAt) {
    filter.createdAt = createdAt;
  }

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("doctor", "name specialization")
      .lean(),
    Patient.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { patients, pagination: getPaginationData({ total, page, limit }) },
        "Patients fetched successfully",
      ),
    );
});

//update patient
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  const previousDoctorId = String(patient.doctor);
  const newDoctorId = req.body.doctor
    ? String(req.body.doctor)
    : previousDoctorId;
  const isDoctorChanged = newDoctorId !== previousDoctorId;

  if (isDoctorChanged) {
    const doctorExists = await Doctor.exists({ _id: newDoctorId });
    if (!doctorExists) {
      throw new ApiError(404, "New doctor not found");
    }
  }

  patient.set(req.body);
  await patient.save();

  if (isDoctorChanged) {
    await Promise.all([
      Doctor.updateOne(
        { _id: previousDoctorId },
        { $inc: { patientCount: -1 } },
      ),
      Doctor.updateOne({ _id: newDoctorId }, { $inc: { patientCount: 1 } }),
    ]);
  }

  await patient.populate("doctor", "name specialization");

  return res
    .status(200)
    .json(new ApiResponse(200, { patient }, "Patient updated successfully"));
});

//delete patient
const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) throw new ApiError(404, "Patient not found");
 
  await Doctor.updateOne({ _id: patient.doctor }, { $inc: { patientCount: -1 } });
 
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Patient deleted successfully"));
});

export {
    getPatients,
    updatePatient,
    deletePatient,
}