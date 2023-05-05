const { validationResult } = require('express-validator');
const { ErrorHelper } = require("../helpers");
const { formatErrors } = ErrorHelper;

exports.format = (req, res, next) => {

    const errors = validationResult(req).array();
    const formattedErrors = formatErrors(errors);

    if (errors.length > 0) {
        return res.status(422).json({ errors: formattedErrors });
    }

    next();

}