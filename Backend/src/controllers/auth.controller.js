const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userModel = require("../models/user.model")
const tokenBlacklistModel = require("../models/blacklist.model")

const TOKEN_TTL = "1d"

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
}

function toPublicUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
    }
}

function issueToken(user) {
    return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_TTL,
    })
}

/**
 * @route POST /api/auth/register
 * @description Create an account and start a session.
 * @access Public
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body

    const existingUser = await userModel.findOne({
        $or: [{ username }, { email }],
    })

    if (existingUser) {
        return res.status(400).json({
            message: "Account already exists with this email address or username.",
        })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: passwordHash,
    })

    res.cookie("token", issueToken(user), COOKIE_OPTIONS)

    res.status(201).json({
        message: "User registered successfully.",
        user: toPublicUser(user),
    })
}

/**
 * @route POST /api/auth/login
 * @description Start a session for an existing account.
 * @access Public
 */
async function loginUserController(req, res) {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    // Same response for "no such user" and "wrong password" so the endpoint
    // cannot be used to enumerate registered emails.
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password." })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password." })
    }

    res.cookie("token", issueToken(user), COOKIE_OPTIONS)

    res.status(200).json({
        message: "User logged in successfully.",
        user: toPublicUser(user),
    })
}

/**
 * @route GET /api/auth/logout
 * @description Invalidate the current token and clear the session cookie.
 * @access Public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token", COOKIE_OPTIONS)

    res.status(200).json({ message: "User logged out successfully." })
}

/**
 * @route GET /api/auth/get-me
 * @description Return the currently authenticated user.
 * @access Private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)

    if (!user) {
        return res.status(404).json({ message: "User not found." })
    }

    res.status(200).json({
        message: "User details fetched successfully.",
        user: toPublicUser(user),
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
}
