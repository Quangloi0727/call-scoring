const express = require('express');
const retentionPolicyController = require('../controllers/dataRetentionPolicyController');
const router = express.Router();
const libsPassport = require('../libs/passport');

router.route('/')
  .get(libsPassport.isAdmin, retentionPolicyController.index);

router.route('/new')
  .get(libsPassport.isAdmin, retentionPolicyController.new);

module.exports = router;