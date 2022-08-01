const {
  ERR_500,
  ERR_401
} = require('../helpers/constants/statusCodeHTTP');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || ERR_500.code;
  err.status = err.status || 'error';

  _logger.error(`------- err ------- Error Controller`);
  _logger.error('err: ', err);
  _logger.error(`------- err ------- Error Controller`);

  if (err.status == 'api' && err.statusCode == 401) {
    let { message } = ERR_401;
    if(err.message) message = err.message;

    return res.status(ERR_401.code).json({ message });
  }

  if (err.statusCode == 404 && req.isAuthenticated()) {
    return res.render('pages/404');
  }

  if(req.isAuthenticated()){
    return res.render('pages/500', {
      error: err
    });
  }
  return res.redirect('/login');
};