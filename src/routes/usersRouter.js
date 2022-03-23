const express = require('express');
const usersController = require('../controllers/usersController');
const router = express.Router();

router.route('/')
    .get(usersController.index);

router.route('/insert')
    .post(usersController.createUser);

router.route('/getUsers')
    .get(usersController.getUsers);

router.route('/changePassword')
    .get(usersController.getChangePassword);

router.route('/resetPassWord')
    .post(usersController.postResetPassWord);

router.route('/changePassword')
    .post(usersController.postChangePassword);

router.route('/importUser')
    .get(usersController.getImportUser);

router.route('/checkDataUser')
    .post(usersController.postCheckDataUser);

router.route('/importUser')
    .post(usersController.postImportUser);

router.route('/search')
    .get(usersController.search);

module.exports = router;