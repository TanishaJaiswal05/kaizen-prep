import { useRef, useState } from "react"
import { useNavigate } from "react-router"

import "../style/home.scss"
import LoadingScreen from "../../../components/LoadingScreen"
import { useInterview } from "../hooks/useInterview.js"

const MAX_CHARS = 5000

const Home = () => {
    const { loading, error, generateReport, reports } = useInterview()

    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [resumeName, setResumeName] = useState("")

    const resumeInputRef = useRef(null)
    const navigate = useNavigate()

    const handleGenerateReport = async (e) => {
        e.preventDefault()

        const resumeFile = resumeInputRef.current?.files?.[0] ?? null

        const data = await generateReport({ jobDescription, selfDescription, resumeFile })

        if (data) {
            navigate(`/interview/${data._id}`)
        }
    }

    if (loading) {
        return <LoadingScreen message="Building your interview plan..." />
    }

    return (
        <div className="home-page">

            <header className="page-header">
                <h1>Create Your Custom <span className="highlight">Interview Plan</span></h1>
                <p>Let our AI analyse the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            <form className="interview-card" onSubmit={handleGenerateReport}>
                <div className="interview-card__body">

                    {/* Left panel — job description */}
                    <div className="panel panel--left">
                        <div className="panel__header">
                            <span className="panel__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className="badge badge--required">Required</span>
                        </div>
                        <textarea
                            onChange={(e) => setJobDescription(e.target.value)}
                            value={jobDescription}
                            className="panel__textarea"
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={MAX_CHARS}
                            required
                        />
                        <div className="char-counter">{jobDescription.length} / {MAX_CHARS} chars</div>
                    </div>

                    <div className="panel-divider" />

                    {/* Right panel — profile */}
                    <div className="panel panel--right">
                        <div className="panel__header">
                            <span className="panel__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        <div className="upload-section">
                            <label className="section-label" htmlFor="resume">
                                Upload Resume
                                <span className="badge badge--best">Best Results</span>
                            </label>
                            <label className="dropzone" htmlFor="resume">
                                <span className="dropzone__icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                </span>
                                <p className="dropzone__title">
                                    {resumeName || "Click to upload or drag & drop"}
                                </p>
                                <p className="dropzone__subtitle">PDF, max 5 MB</p>
                                <input
                                    ref={resumeInputRef}
                                    onChange={(e) => setResumeName(e.target.files?.[0]?.name ?? "")}
                                    hidden
                                    type="file"
                                    id="resume"
                                    name="resume"
                                    accept="application/pdf,.pdf"
                                />
                            </label>
                        </div>

                        <div className="or-divider"><span>OR</span></div>

                        <div className="self-description">
                            <label className="section-label" htmlFor="selfDescription">Quick Self-Description</label>
                            <textarea
                                onChange={(e) => setSelfDescription(e.target.value)}
                                value={selfDescription}
                                id="selfDescription"
                                name="selfDescription"
                                className="panel__textarea panel__textarea--short"
                                maxLength={MAX_CHARS}
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        <div className="info-box">
                            <span className="info-box__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalised plan.</p>
                        </div>
                    </div>
                </div>

                <div className="interview-card__footer">
                    <span className="footer-info">AI-Powered Strategy Generation &bull; Approx 30s</span>
                    <button type="submit" className="generate-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate My Interview Strategy
                    </button>
                </div>

                {error && <p className="form-error" role="alert">{error}</p>}
            </form>

            {reports.length > 0 && (
                <section className="recent-reports">
                    <h2>My Recent Interview Plans</h2>
                    <ul className="reports-list">
                        {reports.map((report) => (
                            <li key={report._id} className="report-item" onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || "Untitled Position"}</h3>
                                <p className="report-meta">Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? "score--high" : report.matchScore >= 60 ? "score--mid" : "score--low"}`}>
                                    Match Score: {report.matchScore}%
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <footer className="page-footer">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Help Center</a>
            </footer>
        </div>
    )
}

export default Home
