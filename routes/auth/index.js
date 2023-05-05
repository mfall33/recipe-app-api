const { verifySignUp, formatErrors } = require("../../middleware");
const { AuthValidator } = require("../validators");
const { AuthController } = require("../../controllers");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/auth/signup",
    [
      AuthValidator.signup,
      formatErrors.format,
      verifySignUp.checkRolesExisted
    ],
    AuthController.signup
  );

  app.post("/auth/signin",
    [
      AuthValidator.signin,
      formatErrors.format
    ],
    AuthController.signin);

  app.post("/auth/signout", AuthController.signout);
};