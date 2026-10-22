import { z } from "zod";

export const patientSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
    age: z.number().min(0, "Age cannot be negative").max(130, "Age is too high"),
    gender: z.enum(["Male", "Female", "Other"], "Gender is required"),
    phone: z.string().trim().regex(/^\+?[0-9\s-]{7,15}$/, "Invalid phone number").optional(),
    condition: z.string().trim().max(1000, "Condition description is too long").optional(),
})


export const updatePatientSchema = z.object({
    body: patientSchema.extend({
        doctor: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid doctor ID").optional(),
    }).partial(),
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid patient ID"),
    }),
});

const dateQuery = z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date")
    .optional();

export const patientListSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        condition: z.string().optional(),
        doctor: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid doctor ID").optional(),
        from: dateQuery,
        to: dateQuery,
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    }),
});

export const patientIdParamSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid patient ID"),
    }),
});
