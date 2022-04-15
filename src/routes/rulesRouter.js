const express = require('express');
const rulesController = require('../controllers/rulesController');
const router = express.Router();

router.route('/')
  .get(rulesController.index);

module.exports = router;