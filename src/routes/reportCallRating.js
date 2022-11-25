const express = require('express');
const reportCallRating = require('../controllers/reportCallRating');
const router = express.Router();

router.route('/')
  .get(reportCallRating.index);

router.route('/queryReport')
  .get(reportCallRating.queryReport);


module.exports = router;