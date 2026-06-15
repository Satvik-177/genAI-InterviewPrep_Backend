import mongoose from "mongoose"

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required"],
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400  // auto-delete after 24 hours(TTL index)
    }
})

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)

export default tokenBlacklistModel

//Modifications
//Initially no TTL index - collection grows faster
//Initially no unique index on token