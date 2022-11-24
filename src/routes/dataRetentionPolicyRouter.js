const express = require('express')
const retentionPolicyController = require('../controllers/dataRetentionPolicyController')
const router = express.Router()
const { isLoggedIn, isAdmin } = require('../libs/passport')

router.route('/')
  .get(isLoggedIn, isAdmin, retentionPolicyController.index)

router.route('/detail/:id')
  .get(isLoggedIn, isAdmin, retentionPolicyController.getDetail)

router.route('/replication/:id')
  .get(isLoggedIn, isAdmin, retentionPolicyController.getReplication)

router.route('/new')
  .get(isLoggedIn, isAdmin, retentionPolicyController.new)

router.route('/')
  .post(isLoggedIn, isAdmin, retentionPolicyController.save)

router.route('/update/:id')
  .put(isLoggedIn, isAdmin, retentionPolicyController.update)

router.route('/:id')
  .delete(isLoggedIn, isAdmin, retentionPolicyController.delete)

router.route('/getTeamByIds')
  .get(isLoggedIn, isAdmin, retentionPolicyController.getTeamByIds)

router.route('/getDataRetentionPolicies')
  .get(isLoggedIn, isAdmin, retentionPolicyController.getDataRetentionPolicies)

router.route('/updateStatus')
  .put(isLoggedIn, isAdmin, retentionPolicyController.updateStatus)

module.exports = router