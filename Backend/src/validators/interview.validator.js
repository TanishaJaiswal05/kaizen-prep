const { z } = require("zod")

const MAX_TEXT_LENGTH = 5000

const generateReportSchema = z.object({
    jobDescription: z
        .string({ required_error: "Job description is required." })
        .trim()
        .min(20, "Job description must be at least 20 characters.")
        .max(MAX_TEXT_LENGTH, `Job description must be at most ${MAX_TEXT_LENGTH} characters.`),
    selfDescription: z
        .string()
        .trim()
        .max(MAX_TEXT_LENGTH, `Self description must be at most ${MAX_TEXT_LENGTH} characters.`)
        .optional()
        .default(""),
})

module.exports = { generateReportSchema, MAX_TEXT_LENGTH }
