const express = require('express')
const recordingController = require('../controllers/recordingController')
const router = express.Router()
const { isLoggedIn } = require('../libs/passport')

router.route('/')
  .get(isLoggedIn, recordingController.index)

router.route('/list')
  .get(isLoggedIn, recordingController.getRecording)
router.route('/SaveConfigurationColums')
  .post(isLoggedIn, recordingController.SaveConfigurationColums)
  .delete(isLoggedIn, recordingController.deleteConfigurationColums)

module.exports = router