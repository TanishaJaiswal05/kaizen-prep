const express = require("express")

const interviewController = require("../controllers/interview.controller")
const { authUser } = require("../middlewares/auth.middleware")
const { validate } = require("../middlewares/validate.middleware")
const upload = require("../middlewares/file.middleware")
const { generateReportSchema } = require("../validators/interview.validator")

const interviewRouter = express.Router()

interviewRouter.post(
    "/",
    authUser,
    upload.single("resume"),
    validate(generateReportSchema),
    interviewController.generateInterViewReportController
)

interviewRouter.get("/", authUser, interviewController.getAllInterviewReportsController)

interviewRouter.get("/report/:interviewId", authUser, interviewController.getInterviewReportByIdController)

interviewRouter.post(
    "/resume/pdf/:interviewReportId",
    authUser,
    interviewController.generateResumePdfController
)

module.exports = interviewRouter
