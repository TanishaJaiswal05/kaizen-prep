// Seeds the demo account advertised in the README. Safe to re-run: an existing
// demo user has its password and username reset rather than duplicated.
require("dotenv").config({ path: require("node:path").join(__dirname, "..", "..", ".env") })

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const connectToDB = require("../config/database")
const userModel = require("../models/user.model")

const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@gmail.com"
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo12345"
const DEMO_USERNAME = process.env.DEMO_USERNAME || "demo"

async function seedDemoUser() {
    await connectToDB()

    const password = await bcrypt.hash(DEMO_PASSWORD, 10)

    // Emails are stored as given but matched case-insensitively at login.
    const existing = await userModel.findOne({
        email: new RegExp(`^${DEMO_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    })

    if (existing) {
        existing.username = DEMO_USERNAME
        existing.email = DEMO_EMAIL
        existing.password = password
        await existing.save()

        console.log(`Demo user updated: ${DEMO_EMAIL}`)
    } else {
        await userModel.create({
            username: DEMO_USERNAME,
            email: DEMO_EMAIL,
            password,
        })

        console.log(`Demo user created: ${DEMO_EMAIL}`)
    }
}

seedDemoUser()
    .catch((err) => {
        console.error("Unable to seed the demo user:", err.message)
        process.exitCode = 1
    })
    .finally(() => mongoose.disconnect())
