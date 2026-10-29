// Revoked JWTs are kept only until they expire, then MongoDB removes them.
const mongoose = require("mongoose")

const TOKEN_TTL_SECONDS = 60 * 60 * 24 // matches the JWT lifetime in auth.controller.js

const blacklistTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: [true, "token is required to be added in blacklist"],
        },
    },
    {
        timestamps: true,
    }
)

blacklistTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: TOKEN_TTL_SECONDS })

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)

module.exports = tokenBlacklistModel
