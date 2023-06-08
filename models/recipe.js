
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
    images.map(image => fs.rmSync(`${IMAGE_FOLDER}${image}`))
}

const setSearchField = (field) => {
    return { $regex: '.*' + field + '.*', $options: 'i' }
}

const Recipe = mongoose.model("Recipe", RecipeSchema);
module.exports = Recipe;

module.exports.getRecipes = function (req) {

    let query = {};

    if (req.query.name) {
        query.name = setSearchField(req.query.name);
    }

    return Recipe.find(query).populate('user')
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
    }, { new: true }).populate('user')

}

module.exports.removeRecipe = async function (id) {

    let recipe = await Recipe.findById(id);
    removeImages(recipe.images);

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