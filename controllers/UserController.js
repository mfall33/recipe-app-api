const User = require("../models/user");

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.update = async (req, res) => {

    try {

        const { username } = req.body;

        let user = await User.findById(req.userId)

        if (user.username === username) {
            return res.json(user);
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).json({ errors: { username: 'Username already exists' } });
        }

        user.username = username;
        await user.save()

        return res.status(200).json(user)
        
    } catch (err) {
        res.status(500).json("Failed to update Username")
    }


};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};