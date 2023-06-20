const RecipeValidator = require('./RecipeValidators');
const AuthValidator = require('./AuthValidators');
const UserValidator = require('./UserValidators');
const CollectionValidator = require('./collectionValidators');

module.exports = {
    RecipeValidator: RecipeValidator,
    AuthValidator: AuthValidator,
    UserValidator: UserValidator,
    CollectionValidator: CollectionValidator
}