const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview"

// Created lazily so the module can be imported (e.g. by tests or tooling)
// without a configured API key.
let client = null

function getClient() {
    if (!client) {
        if (!process.env.GOOGLE_GENAI_API_KEY) {
            throw new Error("GOOGLE_GENAI_API_KEY is not set.")
        }

        client = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })
    }

    return client
}

const questionSchema = z.object({
    question: z.string().describe("The question that can be asked in the interview"),
    intention: z.string().describe("The intention of the interviewer behind asking this question"),
    answer: z.string().describe("How to answer this question: the points to cover and the approach to take"),
})

/**
 * The schema is both the model contract and its documentation: every field
 * carries a `.describe()` used to build the prompt sent to Gemini.
 */
const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100).describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
    technicalQuestions: z.array(questionSchema).describe("Technical questions that can be asked in the interview, with their intention and how to answer them"),
    behavioralQuestions: z.array(questionSchema).describe("Behavioral questions that can be asked in the interview, with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("How important this skill is for the job and how much its absence can impact the candidate's chances"),
    })).describe("Skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().int().positive().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day, e.g. data structures, system design, mock interviews"),
        tasks: z.array(z.string()).describe("Concrete tasks to complete on this day"),
    })).describe("A day-wise preparation plan to follow before the interview"),
})

function buildCandidateContext({ resume, selfDescription, jobDescription }) {
    return `
        Resume:
        ${resume || "(not provided)"}

        Self description:
        ${selfDescription || "(not provided)"}

        Job description:
        ${jobDescription}
    `
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const response = await getClient().models.generateContent({
        model: MODEL,
        contents: `Generate an interview report for a candidate with the following details:
            ${buildCandidateContext({ resume, selfDescription, jobDescription })}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        },
    })

    return interviewReportSchema.parse(JSON.parse(response.text))
}

async function generateResumeHtml({ resume, selfDescription, jobDescription }) {
    const resumeSchema = z.object({
        html: z.string().describe("The HTML content of the resume, ready to be converted to PDF"),
    })

    const response = await getClient().models.generateContent({
        model: MODEL,
        contents: `Generate a resume for a candidate with the following details:
            ${buildCandidateContext({ resume, selfDescription, jobDescription })}

            Return a JSON object with a single field "html" containing the resume as HTML.

            Requirements:
            - Tailored to the given job description; highlight the candidate's strengths and relevant experience.
            - Well formatted with a simple, professional design. Colour and typography may be used sparingly.
            - ATS friendly: parsable text, no tables or images carrying essential information.
            - 1-2 pages when printed. Prioritise quality over quantity.
            - Sound like a human-written resume, not like AI-generated copy.
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumeSchema),
        },
    })

    const { html } = resumeSchema.parse(JSON.parse(response.text))

    return html
}

async function createPdfFromHtml(htmlContent) {
    // Containers usually run as root with a small /dev/shm, where Chrome's
    // sandbox and shared-memory defaults both fail. These flags are the
    // standard fix and are harmless outside containers.
    const browser = await puppeteer.launch({
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
        ],
    })

    try {
        const page = await browser.newPage()

        await page.setContent(htmlContent, { waitUntil: "networkidle0" })

        return await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm",
            },
        })
    } finally {
        await browser.close()
    }
}

module.exports = {
    generateInterviewReport,
    generateResumeHtml,
    createPdfFromHtml,
}
