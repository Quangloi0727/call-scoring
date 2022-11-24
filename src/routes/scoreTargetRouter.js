const express = require('express')
const scoreTargetController = require('../controllers/scoreTargetController')
const router = express.Router()
const { isLoggedIn, isAdmin } = require('../libs/passport')
const { checkRoleScoreTarget } = require('../libs/menu-decentralization')

router.route('/')
  .get(isLoggedIn, checkRoleScoreTarget, scoreTargetController.index)
  .post(isLoggedIn, checkRoleScoreTarget, scoreTargetController.create)
  .put(isLoggedIn, checkRoleScoreTarget, scoreTargetController.update)

router.route('/newTarget')
  .get(isLoggedIn, checkRoleScoreTarget, scoreTargetController.new)

router.route('/detail/:id')
  .get(isLoggedIn, checkRoleScoreTarget, scoreTargetController.detail)

router.route('/gets')
  .get(isLoggedIn, checkRoleScoreTarget, scoreTargetController.gets)

router.route('/:id/updateStatus')
  .put(isLoggedIn, checkRoleScoreTarget, scoreTargetController.updateStatus)

router.route('/:id/assignment')
  .put(isLoggedIn, checkRoleScoreTarget, scoreTargetController.assignment)

router.route('/replication/:id')
  .get(isLoggedIn, checkRoleScoreTarget, scoreTargetController.replication)

module.exports = router