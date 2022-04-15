const express = require('express');
const groupsController = require('../controllers/groupsController');
const router = express.Router();
const libsPassport = require('../libs/passport');

router.route('/')
  .get(libsPassport.isAdmin, groupsController.index);

router.route('/insert')
  .post(groupsController.createGroup);

router.route('/getgroups')
  .get(groupsController.getgroups);

router.route(libsPassport.isAdmin, '/detail/:id')
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