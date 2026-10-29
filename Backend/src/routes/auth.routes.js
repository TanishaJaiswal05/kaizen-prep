const { Router } = require("express")

const authController = require("../controllers/auth.controller")
const { authUser } = require("../middlewares/auth.middleware")
const { validate } = require("../middlewares/validate.middleware")
const { registerSchema, loginSchema } = require("../validators/auth.validator")

const authRouter = Router()

authRouter.post("/register", validate(registerSchema), authController.registerUserController)

authRouter.post("/login", validate(loginSchema), authController.loginUserController)

authRouter.post("/logout", authController.logoutUserController)

authRouter.get("/get-me", authUser, authController.getMeController)

module.exports = authRouter
