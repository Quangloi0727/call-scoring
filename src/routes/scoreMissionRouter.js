const express = require('express')
const scoreMissionController = require('../controllers/scoreMissionController')
const router = express.Router()
const libsPassport = require('../libs/passport')


router.route('/')
    .get(scoreMissionController.index)
router.route('/getData')
    .get(scoreMissionController.getScoreMission)

router.route('/getScoreScript')
    .get(scoreMissionController.getDetailScoreScript)

router.route('/configurationColums')
    .post(scoreMissionController.SaveConfigurationColums)
    .delete(scoreMissionController.deleteConfigurationColums)

router.route('/saveCallRating')
    .post(scoreMissionController.saveCallRating)

router.route('/:id/getCallRatingNotes')
    .get(scoreMissionController.getCallRatingNotes)

router.route('/:criteriaGroupId/getCriteriaByCriteriaGroup')
    .get(scoreMissionController.getCriteriaByCriteriaGroup)

router.route('/getAllCriteriaGroup')
    .get(scoreMissionController.getAllCriteriaGroup)

module.exports = router