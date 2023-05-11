const fs = require('fs');

const Recipe = require("../models/recipe");
const { ImageUpload } = require("../helpers");

const { IMAGE_FOLDER } = process.env;

const index = (req, res) => {

    return Recipe.getRecipes(req)
        .then(recipes => res.json(recipes))
        .catch(err => res.status(500).json(err));

}

const mine = (req, res) => {

    return Recipe.getMyRecipes(req)
        .then(recipes => res.json(recipes))
        .catch(err => res.status(500).json(err));

}

const show = (req, res) => {

    return Recipe.getRecipe(req.params.id)
        .then(data => res.status(200).json(data))
        .catch(err => res.status(500).json(err));

}

const create = (req, res) => {

    return Recipe.addRecipe(req)
        .then(data => res.status(200).json(data))
        .catch(err => res.status(500).json("Failed to store recipe: " + err));

}

const update = (req, res) => {

    return Recipe.updateRecipe(req.params.id, req)
        .then(data => res.status(200).json(data))
        .catch(err => res.status(500).json("Failed to update recipe"));

}

const destroy = (req, res) => {

    return Recipe.removeRecipe(req.params.id)
        .then(data => res.status(200).json("Recipe destroyed successfully"))
        .catch(err => res.status(500).json(err));

}

const imageUpload = (req, res) => {

    return ImageUpload(req, res, (err) => {
        if (err) {
            return res.status(500).send({
                error: err.message
            });
        } else {

            
            let files = req.files.map(file => file.filename);
            console.log("REQUEST: " + JSON.stringify(files))

            return Recipe.addImages(req.params.id, files)
                .then(data => res.status(200).json(data))
                .catch(err => res.status(500).json("Failed to upload image"));

        }
    })

}

const imageRemove = (req, res) => {

    return Recipe.removeImage(req.params.id, req.body.image)
        .then(data => {

            fs.rmSync(`${IMAGE_FOLDER}${req.body.image}`);
            return res.status(200).json(data);

        })
        .catch(err => res.status(500).json("Failed to remove image"));

}

module.exports.index = index;
module.exports.mine = mine;
module.exports.show = show;
module.exports.create = create;
module.exports.update = update;
module.exports.destroy = destroy;
module.exports.imageUpload = imageUpload;
module.exports.imageRemove = imageRemove;