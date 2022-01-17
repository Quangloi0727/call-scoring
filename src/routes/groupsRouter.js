const express = require('express');
const groupsController = require('../controllers/groupsController');
const router = express.Router();

router.route('/')
  .get(groupsController.index);

router.route('/insert')
  .post(groupsController.createGroup);

router.route('/getGroups')
  .get(groupsController.getGroups);

router.route('/detail/:id')
  .get(groupsController.detail);

module.exports = router;