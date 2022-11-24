const express = require('express')
const usersController = require('../controllers/usersController')
const router = express.Router()
const { isLoggedIn, isAdmin } = require('../libs/passport')

router.route('/')
    .get(isLoggedIn, isAdmin, usersController.index)

router.route('/insert')
    .post(isLoggedIn, isAdmin, usersController.createUser)

router.route('/getUsers')
    .get(isLoggedIn, isAdmin, usersController.getUsers)

router.route('/changePassword')
    .get(isLoggedIn, isAdmin, usersController.getChangePassword)

router.route('/resetPassWord')
    .post(isLoggedIn, isAdmin, usersController.postResetPassWord)

router.route('/changePassword')
    .post(isLoggedIn, isAdmin, usersController.postChangePassword)

router.route('/importUser')
    .get(isLoggedIn, isAdmin, usersController.getImportUser)

router.route('/checkDataUser')
    .post(isLoggedIn, isAdmin, usersController.postCheckDataUser)

router.route('/importUser')
    .post(isLoggedIn, isAdmin, usersController.postImportUser)

router.route('/search')
    .get(isLoggedIn, isAdmin, usersController.search)

router.route('/blockUser')
    .post(isLoggedIn, isAdmin, usersController.postBlockUser)

router.route('/updateUser')
    .post(isLoggedIn, isAdmin, usersController.updateUser)

module.exports = router