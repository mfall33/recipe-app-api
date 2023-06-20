const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;
const Role = db.role;

const { APP_SECRET_KEY } = process.env;

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
    if (err instanceof TokenExpiredError) {
        return res.status(401).send({ message: "Unauthorized! Access Token was expired!", err: err.expiredAt.toUTCString() });
    }

    return res.sendStatus(401).send({ message: "Unauthorized!" });
}

exports.verifyToken = (req, res, next) => {

    let token = req.headers['x-access-token'];

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token, APP_SECRET_KEY, (err, decoded) => {
        if (err) {
            return catchError(err, res);
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

                    return res.status(403).send({ message: "Requires Admin Role!" });
                    
                })
                .catch(err => res.status(500).send({ message: err }));

        }
        );
}