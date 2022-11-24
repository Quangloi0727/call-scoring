const express = require('express')
const groupsController = require('../controllers/groupsController')
const router = express.Router()
const { isLoggedIn, isAdmin } = require('../libs/passport')

router.route('/')
  .get(isLoggedIn, isAdmin, groupsController.index)

router.route('/insert')
  .post(isLoggedIn, groupsController.createGroup)

router.route('/getgroups')
  .get(isLoggedIn, groupsController.getgroups)

router.route('/detail/:id')
  .get(isLoggedIn, isAdmin, groupsController.detail)

router.route('/')
  .put(isLoggedIn, groupsController.update)

router.route('/')
  .delete(isLoggedIn, groupsController.delete)

router.route('/search')
  .get(isLoggedIn, groupsController.search)

router.route('/add-team')
  .post(isLoggedIn, groupsController.addTeam)

router.route('/remove-team')
  .delete(isLoggedIn, groupsController.removeTeam)

router.route('/team-of-group')
  .get(isLoggedIn, groupsController.teamOfGroup)

router.route('/get-team-available')
  .get(isLoggedIn, groupsController.getTeamAvailable)

module.exports = router