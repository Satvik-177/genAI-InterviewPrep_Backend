import express from "express"
import authRoute from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import interviewRouter from "./routes/interview.routes.js"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import chatRouter from "./routes/chat.routes.js"



const app = express()

app.use(morgan("dev"))

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,                    // 100 requests per 15 min per IP
    message: {
        message: "Too many requests, please try again after 15 minutes"
    }
})
app.use(globalLimiter)

const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 10,                    // 10 AI requests per hour per IP
    message: {
        message: "AI request limit exceeded, please try again after 1 hour"
    }
})

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: function(origin, callback) {
        // Vercel ke saare URLs allow karo
        if(!origin || 
           origin.includes('vercel.app') || 
           origin === 'http://localhost:5173') {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))

app.use("/api/auth",authRoute)
app.use("/api/interview",aiLimiter,interviewRouter)
app.use("/api/chat", chatRouter)

app.use((req,res)=>{
    res.status(404).json({message:"Route not found"})
})

app.use((err,req,res,next)=>{
    console.error(err.stack)
    res.status(err.status || 500).json({
        message:err.message || "Internal server error"
    })
})


export default app