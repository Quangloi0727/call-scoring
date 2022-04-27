const express = require('express');
const scoreScriptsController = require('../controllers/scoreScriptsController');
const router = express.Router();
const libsPassport = require('../libs/passport');

router.route('/')
  .get(libsPassport.isAdmin, scoreScriptsController.index);
  router.route('/new')
  .get(libsPassport.isAdmin, scoreScriptsController.new);

router.route('/insert')
  .post(scoreScriptsController.createGroup);

router.route('/getgroups')
  .get(scoreScriptsController.getgroups);

router.route('/detail/:id')
  .get(libsPassport.isAdmin, scoreScriptsController.detail);

router.route('/')
  .put(scoreScriptsController.update);

router.route('/')
  .delete(scoreScriptsController.delete);

router.route('/search')
  .get(scoreScriptsController.search);

router.route('/add-team')
  .post(scoreScriptsController.addTeam);

router.route('/remove-team')
  .delete(scoreScriptsController.removeTeam);

router.route('/team-of-group')
  .get(scoreScriptsController.teamOfGroup);

  router.route('/get-team-available')
  .get(scoreScriptsController.getTeamAvailable);

module.exports = router;