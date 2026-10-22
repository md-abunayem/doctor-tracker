import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string()
    .toLowerCase()
    .email("invalid email address"),
    password: z.string()
    .min(6, "password must be at least 6 characters long"),
  }),
});
