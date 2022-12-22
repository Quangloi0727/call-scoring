const express = require('express')
const scoreMissionController = require('../controllers/scoreMissionController')
const router = express.Router()
const { isLoggedIn } = require('../libs/passport')
const { checkRoleScoreMission } = require('../libs/menu-decentralization')

router.route('/')
    .get(isLoggedIn, checkRoleScoreMission, scoreMissionController.index)
router.route('/getData')
    .get(isLoggedIn, checkRoleScoreMission, scoreMissionController.getScoreMission)

router.route('/getScoreScript')
    .get(isLoggedIn, scoreMissionController.getDetailScoreScript)

router.route('/configurationColums')
    .post(isLoggedIn, checkRoleScoreMission, scoreMissionController.SaveConfigurationColums)
    .delete(isLoggedIn, checkRoleScoreMission, scoreMissionController.deleteConfigurationColums)

router.route('/saveCallRating')
    .post(isLoggedIn, checkRoleScoreMission, scoreMissionController.saveCallRating)

router.route('/:callId/getCallRatingNotes')
    .get(isLoggedIn, checkRoleScoreMission, scoreMissionController.getCallRatingNotes)

router.route('/:callId/getCallRatingHistory')
    .get(isLoggedIn, checkRoleScoreMission, scoreMissionController.getCallRatingHistory)

router.route('/:criteriaGroupId/getCriteriaByCriteriaGroup')
    .get(isLoggedIn, checkRoleScoreMission, scoreMissionController.getCriteriaByCriteriaGroup)

router.route('/:callId/getCriteriaGroupByCallRatingId')
    .get(isLoggedIn, scoreMissionController.getCriteriaGroupByCallRatingId)

router.route('/:id/checkScored')
    .get(isLoggedIn, scoreMissionController.checkScored)

module.exports = router