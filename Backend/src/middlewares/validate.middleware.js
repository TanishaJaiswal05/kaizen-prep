/**
 * Validates req.body against a zod schema and replaces it with the parsed
 * (trimmed, coerced) value. Returns a compact field-level error list on failure.
 */
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid request body.",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join(".") || "body",
                    message: issue.message,
                })),
            })
        }

        req.body = result.data
        next()
    }
}

module.exports = { validate }
