
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
    }
});

const removeImages = (images) => {
    images.map(image => fs.rmSync(`${IMAGE_FOLDER}${image}`))
}

const setSearchField = (field) => {
    return { $regex: '.*' + field + '.*', $options: 'i' }
}

const Recipe = mongoose.model("Recipes", RecipeSchema);
module.exports = Recipe;

module.exports.addRecipe = function (req) {

    let recipe = new Recipe({
        name: req.name,
        duration: req.duration,
        images: []
    });

    return recipe.save()
}

module.exports.addImages = function (id, images) {

    return Recipe.findByIdAndUpdate(id,
        { $push: { "images": { $each: images } } }
        , { new: true })

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

module.exports.updateRecipe = function (id, req) {

    return Recipe.findByIdAndUpdate(id, {
        "name": req.body.name,
        "duration": req.body.duration
    }, { new: true })

}

module.exports.getRecipes = function (req) {

    let query = {};

    if (req.query.name) {
        query.name = setSearchField(req.query.name);
    }

    return Recipe.find(query)
        .sort({ name: 'ascending' });

}

module.exports.getRecipe = function (id) {

    return Recipe.find({ "_id": id })

}

module.exports.removeRecipe = async function (id) {

    let recipe = await Recipe.findById(id);
    removeImages(recipe.images);

    return Recipe.findByIdAndDelete(id);

}