const fs = require("node:fs")
const path = require("node:path")

const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const multer = require("multer")

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

const app = express()

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173"

app.use(express.json({ limit: "1mb" }))
app.use(cookieParser())
app.use(
    cors({
        origin: CLIENT_ORIGIN,
        credentials: true,
    })
)

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// Single-origin deployment: the built React app is served from this same
// process, so the session cookie stays first-party and no CORS is involved.
// In local development there is no build, and Vite serves the app on :5173.
const CLIENT_DIST = path.join(__dirname, "..", "..", "Frontend", "dist")
const clientIndex = path.join(CLIENT_DIST, "index.html")

if (fs.existsSync(clientIndex)) {
    app.use(express.static(CLIENT_DIST))

    // Client-side routes (/login, /interview/:id) resolve to the SPA shell.
    // /api/* is excluded so unknown endpoints still get the JSON 404 below.
    app.get(/^(?!\/api\/).*/, (req, res) => {
        res.sendFile(clientIndex)
    })
}

// Unknown routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found." })
})

// Central error handler: keeps controllers focused on the happy path.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const message =
            err.code === "LIMIT_FILE_SIZE"
                ? "Resume must be 5 MB or smaller."
                : `Upload failed: ${err.message}`

        return res.status(400).json({ message })
    }

    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Malformed JSON body." })
    }

    const status = err.status || 500

    if (status >= 500) {
        console.error(err)
    }

    res.status(status).json({
        message: status >= 500 ? "Something went wrong." : err.message,
    })
})

module.exports = app
