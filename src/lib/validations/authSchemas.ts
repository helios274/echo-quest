import { z } from "zod";

const passwordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters.")
  .max(32, "Password must not exceed 32 characters.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character."
  );

export const signUpBaseSchema = z.object({
  email: z.string().trim().email("Invalid email format."),
  username: z
    .string({
      message: "Username must be a string",
    })
    .trim()
    .min(4, "Username must be at least 4 characters long.")
    .max(30, "Username must not exceed 30 characters.")
    .regex(
      /^[a-zA-Z0-9@._-]+$/,
      "Username can only contain letters, numbers, @, -, _, and ."
    ),
  firstName: z
    .string({
      message: "Username must be a string",
    })
    .trim()
    .min(2, "First name must be at least 2 characters long.")
    .max(30, "First name must not exceed 30 characters."),
  lastName: z
    .string({
      message: "Username must be a string",
    })
    .trim()
    .min(2, "Last name must be at least 2 characters long.")
    .max(30, "Last name must not exceed 30 characters.")
    .optional(),
  password: passwordSchema,
  confirmPassword: z.string().trim(),
});

export const signUpSchema = signUpBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  }
);
