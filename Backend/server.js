// Entry point: load configuration, connect to MongoDB, then start the HTTP server.
require("dotenv").config()

const http = require("node:http")
const app = require("./src/app")
const connectToDB = require("./src/config/database")

const PORT = Number(process.env.PORT) || 3000

async function start() {
    await connectToDB()

    const server = http.createServer(app)

    server.listen(PORT, () => {
        console.log(`kaizen-prep-api listening on http://localhost:${PORT}`)
    })

    const shutdown = (signal) => {
        console.log(`${signal} received, shutting down.`)
        server.close(() => process.exit(0))
    }

    process.on("SIGINT", () => shutdown("SIGINT"))
    process.on("SIGTERM", () => shutdown("SIGTERM"))
}

start().catch((err) => {
    console.error("Unable to start the API:", err.message)
    process.exit(1)
})
