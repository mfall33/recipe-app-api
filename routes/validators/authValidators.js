const { check, body } = require('express-validator');
const messages = require('./messages');
const db = require('../../models');
const { required } = messages;
const User = db.user;

module.exports.signin = [
    body('username')
        .notEmpty().withMessage(required('Username'))
        .custom(val => val.trim().length > 0).withMessage(required('Username')),
    body('password')
        .notEmpty().withMessage(required('Password'))
        .custom(val => val.trim().length > 0).withMessage(required('Password')),
];

module.exports.signup = [
    body('email')
        .notEmpty().withMessage(required('Email'))
        .isEmail().withMessage("Invalid email format!")
        .custom(val => val.trim().length > 0).withMessage(required('Email'))
        .custom(value => {
            return User.findOne({ email: value })
                .then((user) => {
                    if (user) return Promise.reject('Email already taken')
                })
        }),
    body('username')
        .notEmpty()
        .withMessage(required('Username'))
        .custom(value => {
            return User.findOne({ username: value })
                .then((user) => {
                    if (user) return Promise.reject('Username already taken')
                })
        })
        .custom(val => val.trim().length > 0).withMessage(required('Username')),
    body('password', 'Password must be at least 8 characters long with at least one special character and 1 uppercase character')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 0,
            minSymbols: 1,
        })
        .custom(val => val.trim().length > 0).withMessage(required('Username')),
];