// Single responsibility: own the mongoose connection lifecycle.
const mongoose = require("mongoose")

const MONGO_URI = process.env.MONGO_URI

async function connectToDB() {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is not set. Copy .env.example to .env and fill it in.")
    }

    mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err.message)
    })

    await mongoose.connect(MONGO_URI)
    console.log("Connected to MongoDB")
}

module.exports = connectToDB
