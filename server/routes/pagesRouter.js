const express = require('express');

const pagesController = require('../controllers/pagesController');

const router = express.Router();

router.route('/')
  .get(pagesController.index);

router.route('/delete')
  .delete(pagesController.deleteByID);

router.route('/change-active')
  .put(pagesController.changeActive);

router.route('/create')
  .get(pagesController.renderCreate)
  .post(pagesController.create);

router.route('/edit/:id')
  .get(pagesController.renderEdit)
  .put(pagesController.updateByID);

router.route('/async-data')
  .get(pagesController.asyncData);

module.exports = router;