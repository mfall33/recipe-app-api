const { RecipeValidator } = require('../validators');
const { RecipeController } = require('../../controllers')
const { authorizeJwt, formatErrors, ensureRecipeOwner } = require("../../middleware");

module.exports = function (app) {

    /* 
        ensureRecipeOwner should be applied to modification 
        requests on any recipe where the recipes content is updated (not likes)
    */

    app.get('/recipes', authorizeJwt.verifyToken, RecipeController.index)
    app.get('/recipes/mine', authorizeJwt.verifyToken, RecipeController.mine)
    app.get('/recipes/liked', authorizeJwt.verifyToken, RecipeController.liked)
    app.get('/recipes/:id', authorizeJwt.verifyToken, RecipeController.show);
    app.post('/recipes', [authorizeJwt.verifyToken, RecipeValidator.post, formatErrors.format], RecipeController.create);
    app.post('/recipes/:id/image', [authorizeJwt.verifyToken, ensureRecipeOwner], RecipeController.imageUpload);
    app.delete('/recipes/:id/image', [authorizeJwt.verifyToken, ensureRecipeOwner], RecipeController.imageRemove);
    app.put('/recipes/:id', [authorizeJwt.verifyToken, RecipeValidator.update, formatErrors.format, ensureRecipeOwner], RecipeController.update);
    app.put('/recipes/:id/like', [authorizeJwt.verifyToken], RecipeController.like);
    app.delete('/recipes/:id', [authorizeJwt.verifyToken, ensureRecipeOwner], RecipeController.destroy);

}