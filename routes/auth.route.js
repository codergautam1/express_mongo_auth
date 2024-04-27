const express = require('express');
const router = express.Router();
const UserModel = require('../models/User.model');
const createError = require('http-errors');
const {userAuthSchema} = require('../helpers/SchemaValidation')
const {singedAccessToken, refreshAccessToken} = require("../helpers/jwtHelper");

router.post("/login", async (req, res,next) => {
    try {
        const userResult = await userAuthSchema.validateAsync(req.body)
        const user = await UserModel.findOne({email:userResult.email},{})
        if(!user) throw createError.BadRequest("Invalid email")
        const isPasswordValid = await user.isPasswordValid(userResult.password)
        if(!isPasswordValid) throw createError.BadRequest("Invalid password")
        const token = await singedAccessToken(user.email)
        const refreshToken = await refreshAccessToken(user.email)

        res.status(200).json({token:token,refreshToken:refreshToken})
    }catch(err) {
        if(err.isJoi === true) res.statusCode = 422
        next(err)
    }
})

router.post("/register", async (req, res, next) => {
    try {
        const result = await userAuthSchema.validateAsync(req.body)
        const existingUser = await UserModel.findOne({email:result.email})
        console.log(existingUser)
        if (existingUser) throw createError.Conflict(`${result.email} is already in use`)

        const user = new UserModel(result)
        const savedUser = await user.save()
        const token = await singedAccessToken(savedUser.email)
        const refreshToken = await refreshAccessToken(user.email)
        res.status(200).json({token:token,refreshToken:refreshToken})
    } catch (err) {
        if(err.isJoi === true) res.statusCode = 422
        next(err)
    }
})

router.post('/refreshToken', async (req, res) => {
    res.send("Refresh route");
})

router.post("/logout", async (req, res) => {
    res.send("Logout route");
})

module.exports = router;