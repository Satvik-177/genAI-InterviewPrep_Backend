import dotenv from "dotenv"
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Groq from "groq-sdk"
import { jsPDF } from "jspdf"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../../.env') })

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
})

export function invokeGeminiAi() {
    console.log("Groq AI client initialized")
}

export async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate an interview report for a candidate with the following details:
    Resume: ${resume}
    Self Description: ${selfDescription}
    Job Description: ${jobDescription}
    
    Return a JSON object with exactly these fields:
    {
        "matchScore": number between 0-100,
        "title": "job title string",
        "technicalQuestions": [
            {
                "question": "string",
                "intention": "string", 
                "answer": "string"
            }
        ],
        "behavioralQuestions": [
            {
                "question": "string",
                "intention": "string",
                "answer": "string"
            }
        ],
        "skillGaps": [
            {
                "skill": "string",
                "severity": "low" or "medium" or "high"
            }
        ],
        "preparationPlan": [
            {
                "day": number,
                "focus": "string",
                "tasks": ["string", "string"]
            }
        ]
    }
    
    Return ONLY the JSON object, no extra text.`

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3
        })

        const text = response.choices[0].message.content
        return JSON.parse(text)

    } catch(err) {
        console.error("Groq error:", err)
        throw new Error(`Failed to generate interview report: ${err.message}`)
    }
}

async function generatePdfFromHtml(htmlContent) {
    const doc = new jsPDF()

    const plainText = htmlContent
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n$1\n")
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n$1\n")
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n$1\n")
        .replace(/<li[^>]*>(.*?)<\/li>/gi, "• $1\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()

    doc.setFontSize(11)
    doc.text(plainText, 15, 15, { maxWidth: 180 })

    return Buffer.from(doc.output('arraybuffer'))
}

export async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate a professional resume for:
    Resume: ${resume}
    Self Description: ${selfDescription}
    Job Description: ${jobDescription}
    
    Return a JSON object with exactly this field:
    {
        "html": "complete HTML string for the resume"
    }
    
    The resume should be well formatted, ATS friendly, and professional.
    Return ONLY the JSON object, no extra text.`

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3
        })

        const text = response.choices[0].message.content
        const jsonContent = JSON.parse(text)
        return await generatePdfFromHtml(jsonContent.html)

    } catch(err) {
        console.error("Groq error:", err)
        throw new Error(`Failed to generate resume PDF: ${err.message}`)
    }
}

export async function chatWithAI({ report, message, history }) {
    const systemPrompt = `You are an interview preparation assistant. 
    You have access to the candidate's interview report.
    
    Report Details:
    - Job Title: ${report.title}
    - Match Score: ${report.matchScore}%
    - Technical Questions: ${JSON.stringify(report.technicalQuestions)}
    - Behavioral Questions: ${JSON.stringify(report.behavioralQuestions)}
    - Skill Gaps: ${JSON.stringify(report.skillGaps)}
    - Preparation Plan: ${JSON.stringify(report.preparationPlan)}
    
    Help the candidate understand their report and prepare for the interview.
    Keep answers concise and helpful.`

    try {
        const messages = [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: message }
        ]

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            temperature: 0.3
        })

        return response.choices[0].message.content

    } catch(err) {
        console.error("Chat AI error:", err)
        throw new Error(`Chat failed: ${err.message}`)
    }
}