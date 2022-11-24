const express = require('express')
const additionalFieldController = require('../controllers/additionalFieldController')
const router = express.Router()
const { isLoggedIn, isAdmin } = require('../libs/passport')

router.route('/')
    .get(isLoggedIn, isAdmin, additionalFieldController.index)

router.route('/:id/edit')
    .put(isLoggedIn, isAdmin, additionalFieldController.edit)

module.exports = router