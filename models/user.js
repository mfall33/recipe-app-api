const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }
    ]
})

const User = mongoose.model(
    "User", UserSchema
);

module.exports = User;