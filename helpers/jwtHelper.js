const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const redisClient = require('./initRedis')
const JWT_SECRET = process.env.JWT_SECRET
const REFRESH_ACCESS_TOKEN = process.env.JWT_SECRET_REFRESH
module.exports = {
    singedAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                email: userId,
            }
            const options = {expiresIn: '1d'};
            jwt.sign(payload, JWT_SECRET, options, (err, token) => {
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
                email: userId,
            }
            const options = {expiresIn: '1y'};
            jwt.sign(payload, REFRESH_ACCESS_TOKEN, options, async (err, token) => {
                if (err) {
                    console.log(err)
                    return reject(createError.InternalServerError())
                }
                redisClient.set(userId, token, 'EX', 365 * 24 * 60 * 60).then((value, err) => {
                    if (err) {
                        console.log(err)
                        reject(createError.InternalServerError())
                        return
                    }
                    resolve(token)
                })
            })
        })
    },
    verifyToken: (req, res, next) => {
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
        } catch (e) {
            console.log(e)
            next(createError.Unauthorized())
        }

    },
    verifyRefreshToken: async (token) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, REFRESH_ACCESS_TOKEN, async (err, decoded) => {
                try {
                    if (err) {
                        console.log(err)
                        return reject(createError.Unauthorized())
                    }
                    const result = await redisClient.get(decoded.email)
                    if (result === token) return resolve(decoded.email)
                    return reject(createError.Unauthorized())
                }catch (e) {
                    reject(e)
                }
            })
        })
    }
}