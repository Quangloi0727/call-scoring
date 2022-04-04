const express = require('express');

const authRouter = require('./authRouter');
const recordingRouter = require('./recordingRouter');
const usersRouter = require('./usersRouter');
const teamsRouter = require('./teamsRouter');
const { isLoggedIn } = require('../libs/passport');

const router = express.Router();

router.use(authRouter);
router.use('/recording', isLoggedIn, recordingRouter);
router.use('/users', isLoggedIn, usersRouter);
router.use('/teams', isLoggedIn, teamsRouter);
module.exports = router;