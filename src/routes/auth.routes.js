import express from "express"
import {
    userRegisterController,
    loginUserController,
    logoutUserController,
    getMeController
} from "../controllers/auth.controller.js"
import { authUser } from "../middlewares/auth.middleware.js"

const authRoute = express.Router()

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRoute.post("/register", userRegisterController)

/**
 * @route POST /api/auth/login
 * @description Login existing user
 * @access Public
 */
authRoute.post("/login", loginUserController)

/**
 * @route POST /api/auth/logout
 * @description Blacklist token and clear cookie
 * @access Private
 */
authRoute.post("/logout", authUser, logoutUserController)

/**
 * @route GET /api/auth/get-me
 * @description Get current logged in user
 * @access Private
 */
authRoute.get("/get-me", authUser, getMeController)

export default authRoute