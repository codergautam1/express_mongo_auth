const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const UserModel = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    }
})

UserModel.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next()
    } catch (err) {
        next(err);
    }
})

UserModel.methods.isPasswordValid = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    }catch (e) {
        throw e
    }
}

const user = mongoose.model('user', UserModel)
module.exports = user;