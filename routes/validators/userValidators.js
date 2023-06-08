const { body } = require('express-validator');
const messages = require('./messages');
const { required } = messages;

module.exports.username = [
    body('username')
        .notEmpty().withMessage(required('Username'))
        .custom((value) => !/\s/.test(value)).withMessage('Username cannot contain spaces'),
];