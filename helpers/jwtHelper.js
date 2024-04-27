const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const JWT_SECRET = process.env.JWT_SECRET
const REFRESH_ACCESS_TOKEN = process.env.JWT_SECRET_REFRESH
module.exports = {
    singedAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                userId: userId,
            }
            const options = {expiresIn: '1d'};
            jwt.sign(payload, JWT_SECRET,options, (err, token) => {
                if (err) {
                    console.log(err)
                    return reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    refreshAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                userId: userId,
            }
            const options = {expiresIn: '1y'};
            jwt.sign(payload, REFRESH_ACCESS_TOKEN,options, (err, token) => {
                if (err) {
                    console.log(err)
                    return reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    verifyToken: (req,res,next) => {
        try {
            if (!req.headers['authorization']) createError.Unauthorized()
            const bearerToken = req.headers['authorization'];
            const token = bearerToken.split(' ')[1]
            jwt.verify(token, JWT_SECRET, (err, decoded) => {
                if (err) {
                    console.log(err)
                    next(createError.Unauthorized())
                }
                req.payload = decoded
                next()
            })
        }catch (e) {
            console.log(e)
            next(createError.Unauthorized())
        }

    }
}