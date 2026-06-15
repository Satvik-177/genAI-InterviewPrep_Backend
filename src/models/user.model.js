import mongoose from "mongoose"

const userSchema = new mongoose.Schema({

    username:{
        type:String,
        unique:true,
        trim:true,
        required:[true,"Username is required"]
    },

    email:{

        type:String,
        unique:true,
        required:[true,"email is required"],
        lowercase:true,
        trim:true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },

    password:{
        type:String,
        required:[true,"Password is required"],
        select:false
    }
}, { timestamps:true })

const userModel = mongoose.model("users",userSchema)

export default userModel