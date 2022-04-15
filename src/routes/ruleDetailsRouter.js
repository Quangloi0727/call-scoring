const express = require('express');
const ruleDetailsController = require('../controllers/ruleDetailsController');
const router = express.Router();

router.route('/')
  .post(ruleDetailsController.create);

router.route('/:id')
  .put(ruleDetailsController.update);

module.exports = router;