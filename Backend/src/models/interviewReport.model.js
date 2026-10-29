const mongoose = require("mongoose")

// The whole report is stored as one embedded document: it is always read and
// written as a unit, so there is nothing to normalise.

const questionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: [true, "Question is required"],
        },
        intention: {
            type: String,
            required: [true, "Intention is required"],
        },
        answer: {
            type: String,
            required: [true, "Answer is required"],
        },
    },
    { _id: false }
)

const skillGapSchema = new mongoose.Schema(
    {
        skill: {
            type: String,
            required: [true, "Skill is required"],
        },
        severity: {
            type: String,
            enum: ["low", "medium", "high"],
            required: [true, "Severity is required"],
        },
    },
    { _id: false }
)

const preparationPlanSchema = new mongoose.Schema(
    {
        day: {
            type: Number,
            required: [true, "Day is required"],
            min: 1,
        },
        focus: {
            type: String,
            required: [true, "Focus is required"],
        },
        tasks: [
            {
                type: String,
                required: [true, "Task is required"],
            },
        ],
    },
    { _id: false }
)

const interviewReportSchema = new mongoose.Schema(
    {
        jobDescription: {
            type: String,
            required: [true, "Job description is required"],
        },
        resume: {
            type: String,
            default: "",
        },
        selfDescription: {
            type: String,
            default: "",
        },
        // Cached output of the resume generator, so a second download does not
        // trigger another model call.
        resumeHtml: {
            type: String,
            default: null,
        },
        matchScore: {
            type: Number,
            min: 0,
            max: 100,
        },
        title: {
            type: String,
            required: [true, "Job title is required"],
        },
        technicalQuestions: [questionSchema],
        behavioralQuestions: [questionSchema],
        skillGaps: [skillGapSchema],
        preparationPlan: [preparationPlanSchema],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

interviewReportSchema.index({ user: 1, createdAt: -1 })

const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema)

module.exports = interviewReportModel
