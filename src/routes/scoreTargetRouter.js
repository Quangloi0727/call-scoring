const express = require('express')
const scoreTargetController = require('../controllers/scoreTargetController')
const router = express.Router()
const libsPassport = require('../libs/passport')


router.route('/')
  .get(libsPassport.isAdmin, scoreTargetController.index)
  .post(libsPassport.isAdmin, scoreTargetController.create)

router.route('/newTarget')
  .get(libsPassport.isAdmin, scoreTargetController.new)

router.route('/gets')
  .get(libsPassport.isAdmin, scoreTargetController.gets)


module.exports = router