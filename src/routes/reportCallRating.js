const express = require('express')
const reportCallRating = require('../controllers/reportCallRating')
const router = express.Router()

router.route('/')
  .get(reportCallRating.index)

router.route('/queryReport')
  .get(reportCallRating.queryReport)

router.route('/queryReportByScoreScript')
  .get(reportCallRating.queryReportByScoreScript)

router.route('/getCriteria')
  .get(reportCallRating.getCriteria)

router.route('/getCriteriaGroup')
  .get(reportCallRating.getCriteriaGroup)

router.route('/getPercentSelectionCriteria')
  .get(reportCallRating.getPercentSelectionCriteria)

router.route('/exportExcelData')
  .get(reportCallRating.exportExcelData)


router.route('/exportExcelDataByScoreScript')
  .get(reportCallRating.exportExcelDataByScoreScript)

module.exports = router