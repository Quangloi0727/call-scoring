const express = require('express');
const recordingController = require('../controllers/recordingController');
const router = express.Router();

router.route('/')
  .get(recordingController.index);

router.route('/list')
  .get(recordingController.getRecording);
router.route('/SaveConfigurationColums')
  .post(recordingController.SaveConfigurationColums)
  .delete(recordingController.deleteConfigurationColums)
module.exports = router;