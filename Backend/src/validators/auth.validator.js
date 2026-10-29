const { z } = require("zod")

const username = z
    .string({ required_error: "Username is required." })
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be at most 30 characters.")


const email = z
    .string({ required_error: "Email is required." })
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")

const password = z
    .string({ required_error: "Password is required." })
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters.")

const registerSchema = z.object({ username, email, password })

const loginSchema = z.object({
    email,
    password: z.string({ required_error: "Password is required." }).min(1, "Password is required."),
})

module.exports = { registerSchema, loginSchema }
