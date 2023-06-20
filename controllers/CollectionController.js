const Collection = require("../models/collection");

module.exports.getRecipeCollections = async (req, res) => {

    try {

        const collections = await Collection.getRecipeCollections(req);

        const collectionsWithLiked = await Promise.all(
            collections.map((collection) => {

                const recipesWithLiked = collection.recipes.map(recipe => {
                    const liked = recipe.likes.some(like => String(like.user) === req.userId);

                    return {
                        ...recipe.toObject(),
                        liked: liked
                    };
                });

                return {
                    ...collection.toObject(),
                    recipes: recipesWithLiked
                };
            })
        );

        return res.status(200).json(collectionsWithLiked);

    } catch (err) {

        return res.status(500).json({ message: "Failed to retrieve Recipe collection!" })

    }
}

module.exports.createRecipeCollection = async (req, res) => {

    try {

        const collection = await Collection.createRecipeCollection(req);

        return res.status(200).json(collection);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to create collection!" });

    }

}

module.exports.removeRecipeCollection = async (req, res) => {

    return Collection.removeRecipeCollection(req)
        .then(data => res.status(200).json({ message: "Collection removed!" }))
        .catch(err => res.status(500).json({ message: "Failed to remove collection!" }))

}

module.exports.addRecipeToCollection = async (req, res) => {

    try {

        const collection = await Collection.addRecipeToCollection(req);

        return res.status(200).json(collection);

    } catch (err) {

        console.log(err);

        return res.status(500).json({ message: "Failed to update collection!" });

    }

}

module.exports.removeRecipeFromCollection = async (req, res) => {

    try {

        const collection = await Collection.removeRecipeFromCollection(req);

        return res.status(200).json(collection);

    } catch (err) {

        console.log(err);

        return res.status(500).json({ message: "Failed to remove Recipe from collection!" });

    }

}