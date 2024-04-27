const express = require('express');
const router = express.Router();
const UserModel = require('../models/User.model');
const createError = require('http-errors');
const {userAuthSchema} = require('../helpers/SchemaValidation')
const {singedAccessToken} = require("../helpers/jwtHelper");

router.post("/login", async (req, res) => {
    res.send("Login route");
})

router.post("/register", async (req, res, next) => {
    try {
        const result = await userAuthSchema.validateAsync(req.body)
        console.log(result)

        const existingUser = await UserModel.findOne({email:result.email})
        console.log(existingUser)
        if (existingUser) throw createError.Conflict(`${result.email} is already in use`)

        const user = new UserModel(result)
        const savedUser = await user.save()
        const token = await singedAccessToken(savedUser.email)
        res.send({token:token})
    } catch (err) {
        if(err.isJoi === true) res.status = 422
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