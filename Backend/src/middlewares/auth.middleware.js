const jwt = require("jsonwebtoken")

const tokenBlacklistModel = require("../models/blacklist.model")

async function authUser(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({ message: "Authentication required." })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.exists({ token })

    if (isTokenBlacklisted) {
        return res.status(401).json({ message: "Session has been revoked." })
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch {
        return res.status(401).json({ message: "Invalid or expired token." })
    }
}

module.exports = { authUser }
