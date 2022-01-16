const express = require('express');

const authRouter = require('./authRouter');
const recordingRouter = require('./recordingRouter');
const usersRouter = require('./usersRouter');
const { isLoggedIn } = require('../libs/passport');

const router = express.Router();

router.use(authRouter);
router.use('/recording', isLoggedIn, recordingRouter)
router.use('/users', isLoggedIn, usersRouter)
module.exports = router;