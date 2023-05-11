
const express = require('express');
const cors = require("cors");
const cookieSession = require("cookie-session");
require('dotenv').config()
const app = express();
const routes = require("./routes");
const db = require("./models");

const { PORT, COOKIE_SECRET, DB_PATH } = process.env;

const Role = db.role;

db.mongoose.connect(DB_PATH)
    .then(function (data) {
        console.log("DB Connection established..." + DB_PATH);
        initialize();
    })
    .catch((err) => {
        if (err) throw err;
    });


app.use(express.static('public'));
app.use(cors({
    origin: "http://localhost:8081"
}));
app.use(express.json())

app.use(
    cookieSession({
        name: "mfal33-session",
        secret: COOKIE_SECRET,
        httpOnly: true
    })
);

app.use("/api", routes);

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});

// Roles Seeder
function initialize() {
    Role.find({}).estimatedDocumentCount()
        .then(count => {
            if (count <= 0) {
                // initialize 'admin' role
                new Role({
                    name: "admin"
                })
                    .save()
                    .then(data => console.log("'Admin' role created"))
                    .catch(err => console.log("Failed to created 'Admin' role"));


                // initialize 'user' role
                new Role({
                    name: "user"
                })
                    .save()
                    .then(data => console.log("'User' role created"))
                    .catch(err => console.log("Failed to created 'User' role"));
            }
        })
        .catch(err => console.log("ERR: " + err));

}