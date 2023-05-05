const { authorizeJwt } = require("../../middleware");
const controller = require("../../controllers/UserController");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/test/all", controller.allAccess);

    app.get("/test/user", [authorizeJwt.verifyToken], controller.userBoard);

    app.get(
        "/test/admin",
        [authorizeJwt.verifyToken, authorizeJwt.isAdmin],
        controller.adminBoard
    );
};