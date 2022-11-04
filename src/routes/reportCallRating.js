const express = require('express');
const reportCallRating = require('../controllers/reportCallRating');
const router = express.Router();

router.route('/')
  .get(reportCallRating.index);

module.exports = router;