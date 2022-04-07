const express = require('express');
const groupsController = require('../controllers/groupsController');
const router = express.Router();

router.route('/')
  .get(groupsController.index);

router.route('/insert')
  .post(groupsController.createGroup);

router.route('/getgroups')
  .get(groupsController.getgroups);

router.route('/detail/:id')
  .get(groupsController.detail);

router.route('/')
  .put(groupsController.update);

router.route('/')
  .delete(groupsController.delete);

router.route('/search')
  .get(groupsController.search);

router.route('/add-team')
  .post(groupsController.addTeam);

router.route('/remove-team')
  .delete(groupsController.removeTeam);

router.route('/team-of-group')
  .get(groupsController.teamOfGroup);

  router.route('/get-team-available')
  .get(groupsController.getTeamAvailable);

module.exports = router;