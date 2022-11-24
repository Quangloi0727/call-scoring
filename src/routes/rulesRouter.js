const express = require('express')
const rulesController = require('../controllers/rulesController')
const { isLoggedIn, isAdmin } = require('../libs/passport')
const router = express.Router()

router.route('/')
  .get(isLoggedIn, isAdmin, rulesController.index)

module.exports = router