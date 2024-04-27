const joi = require('joi')

const userAuthSchema =  joi.object({
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(8).required(),
})

module.exports = {
    userAuthSchema
}