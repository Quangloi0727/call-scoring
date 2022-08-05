const express = require('express')
const scoreScriptsController = require('../controllers/scoreScriptsController')
const router = express.Router()
const libsPassport = require('../libs/passport')

router.route('/')
  .get(libsPassport.isAdmin, scoreScriptsController.index)
  .post(scoreScriptsController.create)
router.route('/new')
  .get(libsPassport.isAdmin, scoreScriptsController.new)

router.route('/gets')
  .get(scoreScriptsController.gets)

router.route('/detail/:id')
  .get(libsPassport.isAdmin, scoreScriptsController.detail)

router.route('/')
  .put(scoreScriptsController.update)

module.exports = router