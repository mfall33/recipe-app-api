const { validationResult } = require('express-validator');
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const db = require("../models");
const User = db.user;
const Role = db.role;

const { APP_SECRET_KEY } = process.env;

exports.signup = async (req, res) => {

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
    });

    try {

        const newUser = user.save();

        if (newUser) {
            if (req.body.roles) {
                Role.find({ name: { $in: req.body.roles } })
                    .then(roles => {

                        user.roles = roles.map((role) => role._id);

                        user.save()
                            .then(data => console.log("User roles saved..."))
                            .catch(err => console.log("Failed to save user roles"));

                        return res.json({ message: "User was registered successfully!" });

                    })
                    .catch(err => res.status(500).send({ message: err }));

            } else {

                Role.findOne({ name: "user" })
                    .then(role => {
                        user.roles = [role._id];
                        user.save()
                            .then(data => console.log("User roles saved..."))
                            .catch(err => console.log("Failed to save user roles"));
                    })
                    .catch(err => res.status(500).send({ message: err }));

                return res.send({ message: "User was registered successfully!" });
            };
        };

    } catch (err) {
        return res.status(500).json({ "message": "Failed to register user!" });
    }
}

exports.signin = (req, res) => {

    // using the regex below for insensitive case querying
    User.findOne({
        $or: [
            { username: new RegExp(`^${req.body.username}$`, 'i') },
            { email: new RegExp(`^${req.body.username}$`, 'i') },
        ]
    })
        .populate("roles", "-__v")
        .exec()
        .then(user => {

            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({ message: "Invalid Password!" });
            }

            var token = jwt.sign({ id: user.id }, APP_SECRET_KEY, {
                expiresIn: 86400, // 24 hours
            });

            var authorities = [];

            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
            }

            req.session.token = token;

            res.status(200).send({
                id: user._id,
                username: user.username,
                email: user.email,
                roles: authorities,
            });

        })
        .catch(err => res.status(500).send({ message: err }))
};

exports.signout = async (req, res) => {
    try {
        req.session = null;
        return res.status(200).send({ message: "You've been signed out!" });
    } catch (err) {
        this.next(err);
    }
};