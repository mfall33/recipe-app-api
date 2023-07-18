const fs = require('fs');

const Recipe = require("../models/recipe");
const Like = require("../models/like");

const { ImageUpload } = require("../helpers");
const { IMAGE_FOLDER } = process.env;

const index = async (req, res) => {

    try {

        const recipes = await Recipe.getRecipes(req).populate('likes');

        const recipesWithLiked = recipes.map(recipe => {
            const liked = recipe.likes.some(like => {
                return String(like.user) === req.userId;
            });

            return {
                ...recipe.toObject(),
                liked: liked
            };
        });

        return res.json(recipesWithLiked);

    } catch (err) {

        return res.status(500).json(err);

    }

}

const mine = async (req, res) => {

    try {
        const recipes = await Recipe.getMyRecipes(req);

        return res.json(recipes);
    }
    catch (err) {
        return res.status(500).json(err)
    }

}

const liked = async (req, res) => {

    try {

        const recipes = await Recipe.getRecipes(req);

        const likedRecipes = recipes.filter(recipe =>
            recipe.likes.some(like => String(like.user) === req.userId)
        );

        return res.json(likedRecipes);

    } catch (err) {

        return res.status(500).json(err);

    }

};

const show = async (req, res) => {

    try {
        const recipe = await Recipe.getRecipe(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        return res.status(200).json(recipe);
    }
    catch (err) {
        return res.status(500).json(err.message)
    }

}

const create = async (req, res) => {

    try {

        const recipe = await Recipe.addRecipe(req);

        return res.status(200).json(recipe);

    }
    catch (err) {

        return res.status(500).json({ message: "Failed to create recipe" });

    }

}

const update = async (req, res) => {

    try {

        const recipe = await Recipe.updateRecipe(req.params.id, req);

        const liked = recipe.likes.some(like => String(like.user) === req.userId);

        const recipeWithLiked = formatRecipe(recipe, liked);

        return res.status(200).json(recipeWithLiked);

    } catch (err) {

        return res.status(500).json({ message: "Failed to update recipe" });

    }

};

const like = (req, res) => {

    return Recipe.findById(req.params.id)
        .then(recipe => {

            if (!recipe) {
                return res.status(404).json({ message: "Recipe not found!" });
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

                                formatRecipe(savedRecipe, true)

                                const savedRecipeWithLiked = formatRecipe(savedRecipe, true);

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

                            const savedRecipeWithLiked = formatRecipe(savedRecipe, false);

                            return res.status(200).json(savedRecipeWithLiked)
                        });


                })
                .catch(err => res.status(500).json({
                    message: err
                }))

        })
        .catch(err => {
            // should add some logger in here
            console.log(JSON.stringify(err, null, 2))
            return res.status(500).json({
                message: err
            })
        })

}

const destroy = async (req, res) => {

    try {

        await Recipe.removeRecipe(req.params.id);

        return res.status(200).json("Recipe destroyed successfully");

    } catch (err) {
        console.log({ err })
        return res.status(500).json({ message: "Failed to remove recipe!" });

    }

};

const imageUpload = (req, res) => {

    return ImageUpload(req, res, (err) => {

        if (err) {
            return res.status(500).send({
                error: err.message
            });
        } else {

            let files = req.files.map(file => file.filename);

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

const formatRecipe = (recipe, liked) => {
    return {
        _id: recipe._id,
        name: recipe.name,
        duration: recipe.duration,
        images: recipe.images,
        user: recipe.user,
        likes: recipe.likes,
        created_at: recipe.created_at,
        __v: recipe.__v,
        liked: liked
    }
}

module.exports.index = index;
module.exports.mine = mine;
module.exports.liked = liked;
module.exports.show = show;
module.exports.create = create;
module.exports.update = update;
module.exports.like = like;
module.exports.destroy = destroy;
module.exports.imageUpload = imageUpload;
module.exports.imageRemove = imageRemove;