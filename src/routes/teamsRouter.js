const express = require('express')
const teamsController = require('../controllers/teamsController')
const router = express.Router()
const libsPassport = require('../libs/passport')


router.route('/')
  .get(libsPassport.isAdmin, teamsController.index)

router.route('/insert')
  .post(teamsController.createGroup)

router.route('/getTeams')
  .get(teamsController.getTeams)

router.route('/detail/:id')
  .get(libsPassport.isAdmin, teamsController.detail)

router.route('/')
  .put(teamsController.update)

// router.route('/')
//   .delete(teamsController.delete);

router.route('/search')
  .get(teamsController.search)

router.route('/add-user')
  .post(teamsController.addUser)

router.route('/remove-user')
  .delete(teamsController.removeUser)

router.route('/user-of-team')
  .get(teamsController.userOfTeam)

router.route('/get-user-available')
  .get(teamsController.getUserAvailable)

router.route('/:id/updateStatus')
  .put(teamsController.updateStatus)

module.exports = router