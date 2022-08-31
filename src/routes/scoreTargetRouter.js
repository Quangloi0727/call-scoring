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
  .get(libsPassport.isAdmin,libsPassport.isAdmin, scoreTargetController.detail)

router.route('/gets')
  .get(libsPassport.isAdmin,scoreTargetController.gets)

router.route('/:id/updateStatus')
  .put(libsPassport.isAdmin,scoreTargetController.updateStatus)

router.route('/:id/assignment')
  .put(libsPassport.isAdmin,scoreTargetController.assignment)

router.route('/replication/:id')
  .get(libsPassport.isAdmin, scoreTargetController.replication)

module.exports = router