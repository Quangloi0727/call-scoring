const express = require('express')
const scoreScriptsController = require('../controllers/scoreScriptsController')
const router = express.Router()
const { isLoggedIn } = require('../libs/passport')
const { checkRoleScoreScript } = require('../libs/menu-decentralization')

router.route('/')
  .get(isLoggedIn, checkRoleScoreScript, scoreScriptsController.index)
  .post(isLoggedIn, checkRoleScoreScript, scoreScriptsController.create)

router.route('/new')
  .get(isLoggedIn, checkRoleScoreScript, scoreScriptsController.new)

router.route('/:id/replication')
  .get(isLoggedIn, checkRoleScoreScript, scoreScriptsController.replication)

router.route('/gets')
  .get(isLoggedIn, checkRoleScoreScript, scoreScriptsController.gets)

router.route('/detail/:id')
  .get(isLoggedIn, checkRoleScoreScript, scoreScriptsController.detail)

router.route('/:id')
  .put(isLoggedIn, checkRoleScoreScript, scoreScriptsController.update)

router.route('/:id/updateStatus')
  .put(isLoggedIn, checkRoleScoreScript, scoreScriptsController.updateStatus)

module.exports = router