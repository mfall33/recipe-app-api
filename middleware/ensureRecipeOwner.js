const Recipe = require("../models/recipe");

module.exports = (req, res, next) => {

    Recipe.findById(req.params.id)
        .populate('user')
        .then((recipe) => {

            if (!recipe) {
                return res.json({ message: 'Recipe not found!' })
            }

            if (String(recipe.user._id) !== req.userId) {
                return res.status(401).json({ message: 'Unauthorized' })
            }

        })

    next();

}