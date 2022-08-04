const express = require('express')
const scoreMissionController = require('../controllers/scoreMissionController')
const router = express.Router()
const libsPassport = require('../libs/passport')


router.route('/')
    .get(scoreMissionController.index)
router.route('/getData')
    .get(scoreMissionController.getScoreMission)
module.exports = router