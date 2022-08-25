const express = require('express')
const scoreTargetController = require('../controllers/scoreTargetController')
const router = express.Router()
const libsPassport = require('../libs/passport')


router.route('/')
  .get(libsPassport.isAdmin, scoreTargetController.index)
  .post(libsPassport.isAdmin, scoreTargetController.create)
  .put(libsPassport.isAdmin, scoreTargetController.update)

router.route('/newTarget')
  .get(libsPassport.isAdmin, scoreTargetController.new)

router.route('/detail/:id')
  .get(libsPassport.isAdmin, scoreTargetController.detail)

router.route('/gets')
  .get(scoreTargetController.gets)

router.route('/:id/updateStatus')
  .put(scoreTargetController.updateStatus)

router.route('/:id/assignment')
  .put(scoreTargetController.assignment)

router.route('/replication/:id')
  .get(libsPassport.isAdmin, scoreTargetController.replication)

module.exports = router