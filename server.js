import dotenv from "dotenv"
dotenv.config()

import app from "./src/app.js"
import connectToDB from "./src/config/db.js"

process.on("unhandledRejection",(reason)=>{

    console.log("Unhandled Rejection: ", reason)
    process.exit(1)
})

process.on("uncaughtException",(err)=>{
    console.log("Unhandled Exception: ", err)
    process.exit(1)
})

try{

    await connectToDB()
}

catch(err){
    console.error("DB Connection failed:", err.message)
    process.exit(1)
}

const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{

    console.log(`Server is listening on port ${PORT}`)
})