const express = require('express');
const rulesController = require('../controllers/rulesController');
const libsPassport = require('../libs/passport');
const router = express.Router();

router.route('/')
  .get(libsPassport.isAdmin, rulesController.index);

module.exports = router;