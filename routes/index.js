const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(express.urlencoded({ extended: true }))

// auth
require('../routes/auth')(router);

// recipes
require('../routes/recipes')(router);

// recipes
require('../routes/collections')(router);

// users
require('../routes/users')(router);

module.exports = router;