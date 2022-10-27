const express = require('express');
const retentionPolicyController = require('../controllers/dataRetentionPolicyController');
const router = express.Router();
const libsPassport = require('../libs/passport');

router.route('/')
  .get(libsPassport.isAdmin, retentionPolicyController.index);

router.route('/detail/:id')
  .get(libsPassport.isAdmin, retentionPolicyController.getDetail);

router.route('/replication/:id')
  .get(libsPassport.isAdmin, retentionPolicyController.getReplication);

router.route('/new')
  .get(libsPassport.isAdmin, retentionPolicyController.new);

router.route('/')
  .post(libsPassport.isAdmin, retentionPolicyController.save);

router.route('/update/:id')
  .put(libsPassport.isAdmin, retentionPolicyController.update);

router.route('/:id')
  .delete(libsPassport.isAdmin, retentionPolicyController.delete)

router.route('/getTeamByIds')
  .get(retentionPolicyController.getTeamByIds)

router.route('/getDataRetentionPolicies')
  .get(retentionPolicyController.getDataRetentionPolicies)

router.route('/updateStatus')
  .put(libsPassport.isAdmin, retentionPolicyController.updateStatus);

module.exports = router;