const express = require('express');
const router = express.Router();
const UserModel = require('../models/User.model');
const createError = require('http-errors');
const {userAuthSchema} = require('../helpers/SchemaValidation')
const {singedAccessToken, refreshAccessToken, refreshToken, verifyToken, verifyRefreshToken} = require("../helpers/jwtHelper");
const redisClient = require('../helpers/initRedis')
router.post("/login", async (req, res, next) => {
    try {
        const userResult = await userAuthSchema.validateAsync(req.body)
        const user = await UserModel.findOne({email: userResult.email}, {})
        if (!user) throw createError.BadRequest("Invalid email")
        const isPasswordValid = await user.isPasswordValid(userResult.password)
        if (!isPasswordValid) throw createError.BadRequest("Invalid password")
        const token = await singedAccessToken(user.email)
        const refreshToken = await refreshAccessToken(user.email)

        res.status(200).json({token: token, refreshToken: refreshToken})
    } catch (err) {
        if (err.isJoi === true) res.statusCode = 422
        next(err)
    }
})

router.post("/register", async (req, res, next) => {
    try {
        const result = await userAuthSchema.validateAsync(req.body)
        const existingUser = await UserModel.findOne({email: result.email})
        console.log(existingUser)
        if (existingUser) throw createError.Conflict(`${result.email} is already in use`)

        const user = new UserModel(result)
        const savedUser = await user.save()
        const token = await singedAccessToken(savedUser.email)
        const refreshToken = await refreshAccessToken(user.email)
        res.status(200).json({token: token, refreshToken: refreshToken})
    } catch (err) {
        if (err.isJoi === true) res.statusCode = 422
        next(err)
    }
})

router.post('/refreshToken', async (req, res, next) => {
    try {
        const {refreshToken} = req.body
        if (!refreshToken) throw createError.BadRequest()
        const email = await verifyRefreshToken(refreshToken)
        const newRefreshToken = await refreshAccessToken(email)
        const newToken = await singedAccessToken(email)
        res.status(200).json({token: newToken, refreshToken: newRefreshToken})
    } catch (e) {
        next(e)
    }
})

router.post("/logout", async (req, res,next) => {
    try {
        const { refreshToken } = req.body;
        console.log(refreshToken)
        if (!refreshToken) {
            return res.status(400).send("Refresh token is required");
        }
        const userId = await verifyRefreshToken(refreshToken);
        if (!userId) {
            return res.status(401).send("Invalid refresh token");
        }
        const result = await redisClient.del(userId)

        res.status(204);
    } catch (e) {
        console.error("Error during logout:", e);
        next(e);
    }
})

module.exports = router;