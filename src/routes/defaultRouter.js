const express = require('express')
const defaultController = require('../controllers/defaultController')
const router = express.Router()
const { isLoggedIn } = require('../libs/passport')

router.route('/')
    .get(isLoggedIn, defaultController.index)

module.exports = router