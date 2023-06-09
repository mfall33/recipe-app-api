const { check } = require('express-validator');
const messages = require('./messages');
const { required } = messages;

// for multiple criteria use chaining and extra withMessage calls for messages..
module.exports.post = [
    check('name')
        .notEmpty().withMessage(required('Name'))
        .custom(val => val.trim().length > 0).withMessage(required('Name')),
    check('duration')
        .notEmpty().withMessage(required('Duration'))
        .custom(val => val.trim().length > 0).withMessage(required('Duration'))
];

module.exports.update = [
    check('name')
        .notEmpty().withMessage(required('Name'))
        .custom(val => val.trim().length > 0).withMessage(required('Name')),
    check('duration')
        .notEmpty().withMessage(required('Duration'))
        .custom(val => val.trim().length > 0).withMessage(required('Name'))


];