
const mongoose = require('mongoose');
const fs = require('fs');
const { IMAGE_FOLDER } = process.env;

const RecipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false
    },
    duration: {
        type: String,
        required: true,
        unique: false
    },
    images: {
        type: Array,
        required: false,
        unique: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like'
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
});


const removeImages = (images) => {
    images.map(image => {
        try {
            // need to think.. is there a need to do this syncrhronously
            fs.rmSync(`${IMAGE_FOLDER}${image}`);
        } catch (e) {
            // console.log({ e })
        }

    })
}

const setSearchField = (field) => {
    return { $regex: '.*' + field + '.*', $options: 'i' }
}

RecipeSchema.pre('findOneAndDelete', async function (next) {

    const id = this._conditions._id;

    const recipeToDelete = await Recipe.findOne({ _id: id });

    // Import Collection here to avoid circular dependency
    const Collection = require('./collection');
    const Like = require('./like');

    await Like.deleteMany({ recipe: id })

    // find all collections with deleted recipe id
    const collectionsToUpdate = await Collection.find({ recipes: id });

    const updatePromises = collectionsToUpdate.map(async (collection) => {
        const updatedRecipes = collection.recipes.filter(recipeId => recipeId.toString() !== id);
        collection.recipes = updatedRecipes;
        await collection.save();
    });

    // Wait for all update operations to finish before proceeding
    await Promise.all(updatePromises);

    removeImages(recipeToDelete.images)

    next();
})

const Recipe = mongoose.model("Recipe", RecipeSchema);

module.exports = Recipe;

module.exports.getRecipes = function (req) {

    let query = {};

    if (req.query.name) {
        query.name = setSearchField(req.query.name);
    }

    return Recipe.find(query).populate(['user', 'likes'])
        .sort({ name: 'ascending' });

}

module.exports.getMyRecipes = function (req) {

    let query = {};

    if (req.query.name) {
        query.name = setSearchField(req.query.name);
    }

    query.user = req.userId;

    return Recipe.find(query).populate(['user', 'likes'])
        .sort({ name: 'ascending' });

}

module.exports.getRecipe = function (id) {

    return Recipe.findOne({ "_id": id }).populate(['user', 'likes'])

}

module.exports.addRecipe = async function (req) {

    let recipe = new Recipe({
        name: req.body.name,
        duration: req.body.duration,
        user: req.userId,
        images: []
    });

    await recipe.save()
    await recipe.populate('user')

    return recipe;
}

module.exports.updateRecipe = function (id, req) {

    return Recipe.findByIdAndUpdate(id, {
        "name": req.body.name,
        "duration": req.body.duration
    }, { new: true }).populate(['user', 'likes'])

}

module.exports.removeRecipe = async function (id) {

    let recipe = await Recipe.findById(id);

    return Recipe.findByIdAndDelete(id);

}

module.exports.addImages = function (id, images) {

    return Recipe.findByIdAndUpdate(id,
        { $push: { "images": { $each: images } } }
        , { new: true })

}

module.exports.removeImage = function (id, image) {

    return Recipe.findByIdAndUpdate(id,
        { $pull: { "images": image } }
        , { new: true })

}