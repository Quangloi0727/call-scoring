const express = require('express')
const tenantController = require('../controllers/tenantController')
const router = express.Router()
const { isLoggedIn, isAdmin } = require('../libs/passport')

router.route('/')
    .get(isLoggedIn, isAdmin, tenantController.index)
router.route('/uploadLogo')
    .post(isLoggedIn, isAdmin, tenantController.uploadLogo)

module.exports = router