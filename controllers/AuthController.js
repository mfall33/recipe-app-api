var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const db = require("../models");
const { user: User, role: Role, refreshToken: RefreshToken } = db;

const { APP_SECRET_KEY, JWT_EXPIRATION } = process.env;

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

exports.signin = async (req, res) => {

    // using the regex below for insensitive case querying
    User.findOne({
        $or: [
            { username: new RegExp(`^${req.body.username}$`, 'i') },
            { email: new RegExp(`^${req.body.username}$`, 'i') },
        ]
    })
        .populate("roles", "-__v")
        .exec()
        .then(async user => {

            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            var token = jwt.sign({ id: user.id }, APP_SECRET_KEY, {
                expiresIn: Number(JWT_EXPIRATION),
                // expiresIn: 10
            });

            let refreshToken = await RefreshToken.createToken(user);

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
                accessToken: token,
                refreshToken: refreshToken,
            });

        })
        .catch(err => {
            console.log("err: " + err)
            res.status(500).send({ message: err })
        })
};

exports.refreshToken = async (req, res) => {
    const { refreshToken: requestToken } = req.body;

    if (requestToken == null) {
        return res.status(403).json({ message: "Refresh Token is required!" });
    }

    try {
        let refreshToken = await RefreshToken.findOne({ token: requestToken });

        if (!refreshToken) {
            res.status(403).json({ message: "Refresh token is not in database!" });
            return;
        }

        if (RefreshToken.verifyExpiration(refreshToken)) {
            RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();

            res.status(403).json({
                message: "Refresh token was expired. Please make a new signin request",
            });
            return;
        }

        let newAccessToken = jwt.sign({ id: refreshToken.user._id }, APP_SECRET_KEY, {
            expiresIn: Number(JWT_EXPIRATION),
        });

        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: refreshToken.token,
        });

    } catch (err) {
        console.log("ERR: " + err)
        return res.status(500).send({ message: err });
    }
};

exports.signout = async (req, res) => {
    try {
        req.session = null;
        return res.status(200).send({ message: "You've been signed out!" });
    } catch (err) {
        this.next(err);
    }
};