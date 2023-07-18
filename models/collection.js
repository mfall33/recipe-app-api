const mongoose = require('mongoose');
const Recipe = require('./recipe');

const RecipeCollectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    recipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
})

// meaning we don't want one user having two playlists with the same name
RecipeCollectionSchema.index({ name: 1, user: 1 }, { unique: true });

const RecipeCollection = mongoose.model('RecipeCollection', RecipeCollectionSchema);

module.exports = RecipeCollection;

module.exports.createRecipeCollection = (req) => {

    const collection = new RecipeCollection({
        name: req.body.name,
        user: req.userId,
    })

    return collection.save()
        .then(savedCollection => {
            return savedCollection;
        });

}

module.exports.getRecipeCollections = (req) => {

    return RecipeCollection.find({ user: req.userId })
        .populate({
            path: 'recipes',
            populate: [{
                path: 'likes',
                model: 'Like'
            },
            {
                path: 'user',
                model: 'User'
            }]
        })

}

module.exports.removeRecipeCollection = (req) => {

    return RecipeCollection.findByIdAndRemove(req.params.id);

}

module.exports.addRecipeToCollection = async (req) => {

    const collection = await RecipeCollection.findById(req.params.id);

    if (!collection) {
        throw new Error("Collection not found!")
    }

    if (collection.recipes.indexOf(req.body.recipe) > -1) {
        throw new Error("Recipe already exists in Collection!")
    }

    console.log("BODY: " + req.body.recipe)

    const recipe = await Recipe.findById(req.body.recipe);

    console.log("Recipe: " + JSON.stringify(recipe));

    collection.recipes.push(recipe.id);

    const savedCollection = await collection.save();

    return savedCollection;

}

module.exports.removeRecipeFromCollection = async (req) => {

    const collection = await RecipeCollection.findById(req.params.id);

    if (!collection) {
        return res.status(404).json({ message: "Collection not found!" })
    }

    const recipeIndex = collection.recipes.findIndex((recipe) =>
        recipe.equals(req.params.recipeId)
    );

    if (recipeIndex === -1) {
        // Handle recipe not found in the collection
        return res.status(404).json({ message: "Recipe not found!" })
    }

    collection.recipes.splice(recipeIndex, 1);

    const savedCollection = await collection.save();

    return savedCollection;

}

// remove recipe from collection