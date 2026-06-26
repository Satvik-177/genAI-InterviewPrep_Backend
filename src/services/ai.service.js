import dotenv from "dotenv"
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Groq from "groq-sdk"
import htmlPdf from "html-pdf-node"

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
    return new Promise((resolve, reject) => {
        let options = { format: 'A4', margin: { top: "40px", bottom: "40px", left: "40px", right: "40px" } };
        let file = { content: htmlContent };

        htmlPdf.generatePdf(file, options).then(pdfBuffer => {
            resolve(pdfBuffer);
        }).catch(err => {
            reject(err);
        });
    });
}

export async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: `Generate a professional resume in HTML format for:
                    Resume: ${resume}
                    Self Description: ${selfDescription}
                    Job Description: ${jobDescription}
                    
                    Return a JSON object: { "html": "complete HTML string" }
                    
                    The HTML must include:
                    - Inline CSS styling (no external stylesheets)
                    - Professional font: Arial, sans-serif
                    - Clear sections: Summary, Experience, Skills, Projects, Education
                    - Name as large heading at top
                    - Contact info in one line
                    - Section headings with border-bottom
                    - Bullet points for experience
                    - Clean white background
                    - Black text
                    - Proper margins and padding
                    - ATS friendly format
                    - Max 2 pages
                    
                    Example structure:
                    <html>
                    <body style="font-family: Arial, sans-serif; margin: 40px; color: #000;">
                    <h1 style="font-size: 24px; margin-bottom: 4px;">John Doe</h1>
                    <p style="font-size: 12px; color: #555;">email | phone | linkedin</p>
                    <hr/>
                    <h2 style="font-size: 14px; border-bottom: 1px solid #000;">EXPERIENCE</h2>
                    ...
                    </body>
                    </html>
                    
                    Return ONLY the JSON object, no extra text.`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3
        })

        const text = response.choices[0].message.content;
        const jsonResult = JSON.parse(text);
        
        
        const pdfBuffer = await generatePdfFromHtml(jsonResult.html);
        
        
        return pdfBuffer;

    } catch(err) {
        throw new Error(`Failed to generate resume: ${err.message}`)
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