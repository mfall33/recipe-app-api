const { RecipeValidator } = require('../validators');
const { RecipeController } = require('../../controllers')
const { authorizeJwt, formatErrors } = require("../../middleware");

module.exports = function (app) {

    // Could potentially use recipe exists middleware or could just handle at controller level

    app.get('/recipes', authorizeJwt.verifyToken, RecipeController.index)
    app.get('/recipes/mine', authorizeJwt.verifyToken, RecipeController.mine)
    app.get('/recipes/:id', authorizeJwt.verifyToken, RecipeController.show);
    app.post('/recipes', [authorizeJwt.verifyToken, RecipeValidator.post, formatErrors.format], RecipeController.create);
    app.post('/recipes/:id/image', authorizeJwt.verifyToken, RecipeController.imageUpload);
    app.delete('/recipes/:id/image', authorizeJwt.verifyToken, RecipeController.imageRemove);
    app.put('/recipes/:id', [authorizeJwt.verifyToken, RecipeValidator.update, formatErrors.format], RecipeController.update);
    app.put('/recipes/:id/like', [authorizeJwt.verifyToken], RecipeController.like);
    app.delete('/recipes/:id', authorizeJwt.verifyToken, RecipeController.destroy);

}