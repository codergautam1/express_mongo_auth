const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const JWT_SECRET = process.env.JWT_SECRET
module.exports = {
    singedAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                userId: userId
            }
            const options = {expiresIn: '1d'};
            jwt.sign(payload, JWT_SECRET,options, (err, token) => {
                if (err) return reject(err)
                resolve(token)
            })
        })
    }
}