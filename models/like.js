const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Recipe'
    }
});

LikeSchema.index({ user: 1, recipe: 1 }, { unique: true });

const Like = mongoose.model("Like", LikeSchema);

module.exports = Like;