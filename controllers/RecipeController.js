const fs = require('fs');

const Recipe = require("../models/recipe");
const Like = require("../models/like");

const { ImageUpload } = require("../helpers");
const { IMAGE_FOLDER } = process.env;

const index = (req, res) => {

    return Recipe.getRecipes(req).populate('likes')
        .then(recipes => {

            let filteredRecipes = []

            recipes.map(recipe => {
                const liked = recipe.likes.some(like => {

                    console.log(String(like.user) + ' === ' + req.userId)
                    return String(like.user) === req.userId
                });
                const recipeWithLiked = {
                    ...recipe.toObject(),
                    liked: liked
                };
                filteredRecipes.push(recipeWithLiked)
            })

            return res.json(filteredRecipes);

        })
        .catch(err => res.status(500).json(err));

}

const mine = (req, res) => {

    return Recipe.getMyRecipes(req)
        .then(recipes => res.json(recipes))
        .catch(err => res.status(500).json(err));

}

const show = (req, res) => {

    return Recipe.getRecipe(req.params.id)
        .then(recipe => {
            if (!recipe) {
                return res.status(404).json({ message: "Recipe not found" })
            }

            return res.status(200).json(recipeWithLiked)
        })
        .catch(err => res.status(500).json(err.message));

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

const like = (req, res) => {

    return Recipe.findById(req.params.id)
        .then(recipe => {

            if (!recipe) {
                return res.status(404).json("Recipe not found!");
            }

            const query = { user: req.userId, recipe: recipe.id };

            return Like.findOne(query)
                .then(like => {

                    if (!like) {
                        const newLike = new Like(query);
                        return newLike.save()
                            .then(savedLike => {
                                recipe.likes.push(savedLike._id);
                                return recipe.save();
                            })
                            .then(savedRecipe => {

                                const savedRecipeWithLiked = {
                                    _id: savedRecipe._id,
                                    name: savedRecipe.name,
                                    duration: savedRecipe.duration,
                                    images: savedRecipe.images,
                                    user: savedRecipe.user,
                                    likes: savedRecipe.likes,
                                    created_at: savedRecipe.created_at,
                                    __v: savedRecipe.__v,
                                    liked: true
                                }

                                return res.status(200).json(savedRecipeWithLiked)
                            });
                    }

                    return Like.findByIdAndRemove(like._id)
                        .then(() => {

                            const likeIndex = recipe.likes.indexOf(like._id);
                            if (likeIndex > -1) {
                                recipe.likes.splice(likeIndex, 1);
                            }

                            return recipe.save();
                        })
                        .then(savedRecipe => {

                            const savedRecipeWithLiked = {
                                _id: savedRecipe._id,
                                name: savedRecipe.name,
                                duration: savedRecipe.duration,
                                images: savedRecipe.images,
                                user: savedRecipe.user,
                                likes: savedRecipe.likes,
                                created_at: savedRecipe.created_at,
                                __v: savedRecipe.__v,
                                liked: false
                            }

                            return res.status(200).json(savedRecipeWithLiked)
                        });


                })
                .catch(err => res.status(500).json({
                    message: err
                }))

        })
        .catch(err => {
            // should add some logger in here
            return res.status(500).json({
                message: err
            })
        })

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
module.exports.like = like;
module.exports.destroy = destroy;
module.exports.imageUpload = imageUpload;
module.exports.imageRemove = imageRemove;