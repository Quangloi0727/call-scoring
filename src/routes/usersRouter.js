const express = require('express');
const usersController = require('../controllers/usersController');
const router = express.Router();

router.route('/')
    .get(usersController.index);

// router.route('/list')
//     .get(recordingController.getRecording);

module.exports = router;