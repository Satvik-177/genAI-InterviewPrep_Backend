import bcrypt from "bcryptjs"
import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import tokenBlacklistModel from "../models/blacklist.model.js"

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000
}

export const userRegisterController = async(req, res) => {
    try {
        const { username, email, password } = req.body

        if(!username || !email || !password){
            return res.status(400).json({
                message: "Please provide username, email and password"
            })
        }

        const isUserExists = await userModel.findOne({
            $or: [{ email }, { username }]
        })

        if(isUserExists){
            return res.status(400).json({
                message: "User already exists with this email or username"
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, cookieOptions)

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch(err) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const loginUserController = async(req, res) => {
    try {
        const { email, password } = req.body

        if(!email || !password){
            return res.status(400).json({
                message: "Please provide email and password"
            })
        }

        const user = await userModel.findOne({ email }).select("+password")

        if(!user){
            return res.status(400).json({
                message: "Incorrect email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if(!isPasswordValid){
            return res.status(400).json({
                message: "Incorrect email or password"
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, cookieOptions)

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch(err) {
        console.log("Error in login: ",err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const logoutUserController = async(req, res) => {
    try {
        const token = req.cookies.token

        if(token){
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token")

        return res.status(200).json({
            message: "User logged out successfully"
        })
    } catch(err) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getMeController = async(req, res) => {
    try {
        const user = await userModel.findById(req.user.id)

        if(!user){
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch(err) {
        return res.status(500).json({ message: "Internal server error" })
    }
}