const {
  ERR_500,
  ERR_401
} = require('../helpers/constants/statusCodeHTTP');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || ERR_500.code;
  err.status = err.status || 'error';

  console.log(`------- err ------- Error Controller`);
  console.log('err: ', err);
  console.log(`------- err ------- Error Controller`);

  if (err.status == 'api' && err.statusCode == 401) {
    return res.status(ERR_401.code).json(ERR_401);
  }

  if (err.statusCode == 404 && req.isAuthenticated()) {
    return res.render('pages/404');
  }

  return res.redirect('/login');
};