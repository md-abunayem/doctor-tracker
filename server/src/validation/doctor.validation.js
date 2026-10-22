import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid doctor ID");
const dateQuery = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date")
  .optional();
const paginationQuery = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
};
const dateRangeQuery = {
  from: dateQuery,
  to: dateQuery,
};

const doctorBody = z.object({
  name: z.string().trim().min(1, "Name is required"),
  specialization: z
    .string()
    .trim()
    .min(1, "Specialization is required")
    .max(1000, "Specialization is too long"),
  hospital: z
    .string()
    .trim()
    .min(1, "Hospital is required")
    .max(100, "Hospital name is too long"),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{7,15}$/, "Invalid phone number"),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
});

export const createDoctorSchema = z.object({
  body: doctorBody,
});

export const updateDoctorSchema = z.object({
  body: doctorBody.partial(),
  params: z.object({
    id: objectId,
  }),
});


export const getDoctorsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    specialization: z.string().optional(),
    hospital: z.string().optional(),
    ...dateRangeQuery,
    ...paginationQuery,
  }),
});

 
export const doctorIdParamSchema = z.object({
  params: z.object({ doctorId: objectId }),
});

export const doctorIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export const doctorPatientsSchema = z.object({
  params: z.object({ doctorId: objectId }),
  query: z.object({
    search: z.string().optional(),
    condition: z.string().optional(),
    ...dateRangeQuery,
    ...paginationQuery,
  }),
});