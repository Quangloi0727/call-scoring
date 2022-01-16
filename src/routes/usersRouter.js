const express = require('express');
const usersController = require('../controllers/usersController');
const router = express.Router();

router.route('/')
    .get(usersController.index);

router.route('/insert')
    .post(usersController.createUser);

router.route('/getUsers')
    .get(usersController.getUsers);

module.exports = router;