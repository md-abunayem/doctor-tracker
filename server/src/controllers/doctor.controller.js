import { Doctor } from "../models/doctor.model.js";
import { Patient } from "../models/patient.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, getPaginationData } from "../utils/pagination.js";
import { buildDateRangeFilter } from "../utils/dateRange.js";

//create doctor
const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.create({
    ...req.body,
    createdBy: req.user._id,
  });
  await doctor.populate("createdBy", "name email");

  return res
    .status(201)
    .json(new ApiResponse(201, doctor, "Doctor created successfully"));
});

//get all doctors
const getAllDoctors = asyncHandler(async (req, res) => {
  const { search, specialization, hospital, from, to, ...paging } =
    req.validatedQuery ?? req.query;

  const { page, limit, skip } = getPagination(paging);

  const filter = {};
  if (search) {
    filter.$text = { $search: search };
  }
  if (specialization) {
    filter.specialization = specialization;
  }
  if (hospital) {
    filter.hospital = hospital;
  }

  const createdAt = buildDateRangeFilter(from, to);
  if (createdAt) {
    filter.createdAt = createdAt;
  }

  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email")
      .lean(),
    Doctor.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { doctors, pagination: getPaginationData({ total, page, limit }) },
        "Doctors fetched successfully",
      ),
    );
});

//get a doctor by id
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate("createdBy", "name email")
    .lean();
  if (!doctor) throw new ApiError(404, "Doctor not found");

  return res
    .status(200)
    .json(new ApiResponse(200, { doctor }, "Doctor fetched successfully"));
});

//update a doctor by id
const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true },
  ).populate("createdBy", "name email");
  if (!doctor) throw new ApiError(404, "Doctor not found");

  return res
    .status(200)
    .json(new ApiResponse(200, { doctor }, "Doctor updated successfully"));
});

// delete a doctor by id
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  await Patient.deleteMany({ doctor: req.params.id });
  await Doctor.deleteOne({ _id: req.params.id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Doctor and their patients deleted"));
});

//get all patients of a doctor
const getDoctorPatients = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { search, condition, from, to, ...paging } =
    req.validatedQuery ?? req.query;
  const { page, limit, skip } = getPagination(paging);

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  const filter = { doctor: doctorId };
  if (search) {
    filter.$text = { $search: search };
  }
  if (condition) {
    filter.condition = condition;
  }

  const createdAt = buildDateRangeFilter(from, to);
  if (createdAt) {
    filter.createdAt = createdAt;
  }

  const [patients, total] = await Promise.all([
    Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
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

// add a patient to a doctor
const addPatientToDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  const patient = await Patient.create({ ...req.body, doctor: doctorId });
  await Doctor.updateOne({ _id: doctorId }, { $inc: { patientCount: 1 } });

  return res
    .status(201)
    .json(new ApiResponse(201, { patient }, "Patient added successfully"));
});

export {
  createDoctor,
  getDoctorById,
  getAllDoctors,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
  addPatientToDoctor,
};
