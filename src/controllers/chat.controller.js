import interviewReportModel from "../models/interviewReport.model.js"
import { chatWithAI } from "../services/ai.service.js"

export async function chatController(req, res) {
    try {
        const { interviewId } = req.params
        const { message, history } = req.body

        // Report fetch karo
        const report = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        })

        if(!report){
            return res.status(404).json({
                message: "Interview report not found"
            })
        }

        // AI se answer lo
        const answer = await chatWithAI({
            report,
            message,
            history
        })

        return res.status(200).json({
            message: "Success",
            answer
        })

    } catch(err) {
        console.error("Chat error:", err)
        return res.status(500).json({
            message: err.message || "Internal server error"
        })
    }
}