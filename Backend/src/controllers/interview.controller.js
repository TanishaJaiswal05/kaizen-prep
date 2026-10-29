const pdfParse = require("pdf-parse")

const interviewReportModel = require("../models/interviewReport.model")
const {
    generateInterviewReport,
    generateResumeHtml,
    createPdfFromHtml,
} = require("../services/ai.service")

// Fields that are only needed server-side and are never sent to the client.
const INTERNAL_FIELDS = "-__v -resumeHtml"

async function extractResumeText(file) {
    if (!file) return ""

    const parsed = await new pdfParse.PDFParse(Uint8Array.from(file.buffer)).getText()

    return parsed.text.trim()
}

/**
 * @route POST /api/interview
 * @description Generate an interview report from a resume and/or self description plus a job description.
 * @access Private
 */
async function generateInterViewReportController(req, res) {
    const { jobDescription, selfDescription = "" } = req.body

    const resume = await extractResumeText(req.file)

    if (!resume && !selfDescription.trim()) {
        return res.status(400).json({
            message: "Provide a resume PDF or a self description.",
        })
    }

    const generatedReport = await generateInterviewReport({
        resume,
        selfDescription,
        jobDescription,
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume,
        selfDescription,
        jobDescription,
        ...generatedReport,
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport,
    })
}

/**
 * @route GET /api/interview/report/:interviewId
 * @description Fetch one report owned by the caller.
 * @access Private
 */
async function getInterviewReportByIdController(req, res) {
    const { interviewId } = req.params

    const interviewReport = await interviewReportModel
        .findOne({ _id: interviewId, user: req.user.id })
        .select(INTERNAL_FIELDS)

    if (!interviewReport) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport,
    })
}

/**
 * @route GET /api/interview
 * @description List the caller's reports (summary projection only).
 * @access Private
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel
        .find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select("-resume -selfDescription -jobDescription -resumeHtml -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan -__v")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports,
    })
}

/**
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @description Download a resume tailored to the report's job description.
 * @access Private
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findOne({
        _id: interviewReportId,
        user: req.user.id,
    })

    if (!interviewReport) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    // Resume HTML is cached on the report so repeated downloads are stable
    // and do not cost another model call.
    if (!interviewReport.resumeHtml) {
        const html = await generateResumeHtml({ resume, jobDescription, selfDescription })

        interviewReport.resumeHtml = html
        await interviewReport.save()
    }

    const pdfBuffer = await createPdfFromHtml(interviewReport.resumeHtml)

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
    })

    res.send(pdfBuffer)
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
}
