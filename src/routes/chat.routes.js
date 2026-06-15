import express from "express"
import { authUser } from "../middlewares/auth.middleware.js"
import { chatController } from "../controllers/chat.controller.js"

const chatRouter = express.Router()

chatRouter.post("/:interviewId", authUser, chatController)

export default chatRouter