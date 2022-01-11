const express = require('express');

const pagesRouter = require('./pagesRouter');

const router = express.Router();

router.use('/manage-pages', pagesRouter);

module.exports = router;