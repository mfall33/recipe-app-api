const { CollectionValidator } = require('../validators');
const { CollectionController } = require('../../controllers')
const { authorizeJwt, formatErrors } = require("../../middleware");

module.exports = function (app) {

    app.post('/collections', [authorizeJwt.verifyToken, CollectionValidator.post, formatErrors.format], CollectionController.createRecipeCollection);
    app.get('/collections', [authorizeJwt.verifyToken], CollectionController.getRecipeCollections);
    app.put('/collections/:id', [authorizeJwt.verifyToken, CollectionValidator.update, formatErrors.format], CollectionController.addRecipeToCollection);
    app.delete('/collections/:id', [authorizeJwt.verifyToken], CollectionController.removeRecipeCollection);
    app.delete('/collections/:id/recipe/:recipeId', [authorizeJwt.verifyToken], CollectionController.removeRecipeFromCollection);

}