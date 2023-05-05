const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;
const Role = db.role;

const { APP_SECRET_KEY } = process.env;

exports.verifyToken = (req, res, next) => {
    console.log(33);
    let token = req.session.token;

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token, APP_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.userId = decoded.id;
        next();
    });
};

exports.isAdmin = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            Role.find({ _id: { $in: user.roles } })
                .then(roles => {
                    for (let i = 0; i < roles.length; i++) {
                        if (roles[i].name === "admin") {
                            next();
                            return;
                        }
                    }

                    res.status(403).send({ message: "Requires Admin Role!" });
                    return;
                })
                .catch(err => res.status(500).send({ message: err }));

        }
        );
}