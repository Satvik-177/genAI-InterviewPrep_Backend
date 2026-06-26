import { createRequire } from "module"
const require = createRequire(import.meta.url)
const pdfParse = require("pdf-parse")

import { generateInterviewReport, generateResumePdf } from "../services/ai.service.js"
import interviewReportModel from "../models/interviewReport.model.js"

async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body

        if(!jobDescription){
            return res.status(400).json({
                message: "Job description is required"
            })
        }

        if(!selfDescription && !req.file){
            return res.status(400).json({
                message: "Resume or self description is required"
            })
        }

        let resumeText = ""
        if(req.file){
            const resumeContent = await pdfParse(req.file.buffer)
            resumeText = resumeContent.text
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })

    } catch(err) {
        console.error("Error:", err)
        return res.status(500).json({
            message: err.message || "Internal server error"
        })
    }
}

async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        })

        if(!interviewReport){
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch(err) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch(err) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        // Fetch report from database
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        })

        if(!interviewReport){
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        // Generate the PDF binary buffer using the updated AI service
        const pdfBuffer = await generateResumePdf({
            resume,
            jobDescription,
            selfDescription
        })

        // Verify if the buffer is valid before setting headers to prevent corrupt streams
        if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
            throw new Error("Failed to generate a valid PDF buffer")
        }

        // Explicitly set headers for file transfer
        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", `attachment; filename=resume_${interviewReportId}.pdf`)
        res.setHeader("Content-Length", pdfBuffer.length)

        // Stream the binary buffer data directly to the client
        return res.send(pdfBuffer)
        
    } catch(err) {
        console.error("Error in generateResumePdfController:", err)
        
        // Return JSON error only if headers haven't been transmitted yet
        if (!res.headersSent) {
            return res.status(500).json({ message: err.message || "Internal server error" })
        }
    }
}

export {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}