const express = require('express')
const teamsController = require('../controllers/teamsController')
const router = express.Router()
const { isLoggedIn, isAdmin } = require('../libs/passport')


router.route('/')
  .get(isLoggedIn, isAdmin, teamsController.index)

router.route('/insert')
  .post(isLoggedIn, isAdmin, teamsController.createGroup)

router.route('/getTeams')
  .get(isLoggedIn, isAdmin, teamsController.getTeams)

router.route('/detail/:id')
  .get(isLoggedIn, isAdmin, teamsController.detail)

router.route('/')
  .put(isLoggedIn, isAdmin, teamsController.update)

router.route('/search')
  .get(isLoggedIn, isAdmin, teamsController.search)

router.route('/add-user')
  .post(isLoggedIn, isAdmin, teamsController.addUser)

router.route('/remove-user')
  .delete(isLoggedIn, isAdmin, teamsController.removeUser)

router.route('/user-of-team')
  .get(isLoggedIn, isAdmin, teamsController.userOfTeam)

router.route('/get-user-available')
  .get(isLoggedIn, isAdmin, teamsController.getUserAvailable)

router.route('/:id/updateStatus')
  .put(isLoggedIn, isAdmin, teamsController.updateStatus)

module.exports = router