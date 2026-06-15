import express from "express"
import { authUser } from "../middlewares/auth.middleware.js"
import * as interviewController from "../controllers/interview.controller.js"
import upload from "../middlewares/file.middleware.js"

const interviewRouter = express.Router()

// Middleware to check file exists after multer
const requireFile = (req, res, next) => {
    if(!req.file){
        return res.status(400).json({ message: "Resume PDF is required" })
    }
    next()
}

/**
 * @route POST /api/interview/
 * @description Generate new interview report
 * @access Private
 */
interviewRouter.post("/",
    authUser,
    upload.single("resume"),
    interviewController.generateInterViewReportController
)

/**
 * @route GET /api/interview/report/:interviewId
 * @description Get interview report by ID
 * @access Private
 */
interviewRouter.get("/report/:interviewId",
    authUser,
    interviewController.getInterviewReportByIdController
)

/**
 * @route GET /api/interview/
 * @description Get all interview reports of logged in user
 * @access Private
 */
interviewRouter.get("/",
    authUser,
    interviewController.getAllInterviewReportsController
)

/**
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @description Generate resume PDF
 * @access Private
 */
interviewRouter.post("/resume/pdf/:interviewReportId",
    authUser,
    interviewController.generateResumePdfController
)

export default interviewRouter