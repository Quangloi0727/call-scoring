const express = require('express')
const tenantController = require('../controllers/tenantController')
const router = express.Router()
const libsPassport = require('../libs/passport')


router.route('/')
    .get(libsPassport.isAdmin, tenantController.index)
router.route('/uploadLogo')
    .post(tenantController.upload)
module.exports = router