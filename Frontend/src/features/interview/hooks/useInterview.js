import { useContext, useEffect } from "react"
import { useParams } from "react-router"

import { InterviewContext } from "../interview.context"
import {
    generateInterviewReport,
    generateResumePdf,
    getAllInterviewReports,
    getInterviewReportById,
} from "../services/interview.api"

function toMessage(err, fallback) {
    return err.response?.data?.message || err.message || fallback
}

export const useInterview = () => {
    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, error, setError, report, setReport, reports, setReports } =
        context

    const { interviewId } = useParams()

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        setError(null)

        try {
            const data = await generateInterviewReport({
                jobDescription,
                selfDescription,
                resumeFile,
            })

            setReport(data.interviewReport)
            return data.interviewReport
        } catch (err) {
            setError(toMessage(err, "Could not generate your interview plan. Please try again."))
            return null
        } finally {
            setLoading(false)
        }
    }

    const downloadResume = async (id) => {
        const blob = await generateResumePdf({ interviewReportId: id })
        const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }))
        const link = document.createElement("a")

        link.href = url
        link.setAttribute("download", `resume_${id}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()

        window.URL.revokeObjectURL(url)
    }

    const getResumePdf = async (id) => {
        setLoading(true)
        setError(null)

        try {
            await downloadResume(id)
        } catch (err) {
            setError(toMessage(err, "Could not generate your resume PDF. Please try again."))
        } finally {
            setLoading(false)
        }
    }

    // Load whichever view this route needs: a single report or the list.
    useEffect(() => {
        let cancelled = false

        const load = async () => {
            setLoading(true)
            setError(null)

            try {
                if (interviewId) {
                    const data = await getInterviewReportById(interviewId)
                    if (!cancelled) setReport(data.interviewReport)
                } else {
                    const data = await getAllInterviewReports()
                    if (!cancelled) setReports(data.interviewReports)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(toMessage(err, "Could not load your interview data."))
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()

        return () => {
            cancelled = true
        }
    }, [interviewId, setError, setLoading, setReport, setReports])

    return {
        loading,
        error,
        report,
        reports,
        generateReport,
        getResumePdf,
    }
}
