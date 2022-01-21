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

router.route('/')
  .put(groupsController.update);

// router.route('/')
//   .delete(groupsController.delete);

router.route('/search')
  .get(groupsController.search);

router.route('/add-user')
  .post(groupsController.addUser);

router.route('/remove-user')
  .delete(groupsController.removeUser);

router.route('/user-of-team')
  .get(groupsController.userOfTeam);

  router.route('/get-user-available')
  .get(groupsController.getUserAvailable);

module.exports = router;