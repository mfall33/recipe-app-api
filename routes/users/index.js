const { authorizeJwt, formatErrors } = require("../../middleware");
const { UserValidator } = require("../validators");
const { UserController } = require("../../controllers");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.patch("/user", [authorizeJwt.verifyToken, UserValidator.username, formatErrors.format], UserController.update);

};