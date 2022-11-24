const express = require('express')
const ruleDetailsController = require('../controllers/ruleDetailsController')
const router = express.Router()
const { isLoggedIn, isAdmin } = require('../libs/passport')

router.route('/')
  .post(isLoggedIn, isAdmin, ruleDetailsController.create)

router.route('/:id')
  .put(isLoggedIn, isAdmin, ruleDetailsController.update)

module.exports = router