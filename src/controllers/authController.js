const passport = require('passport')

exports.getIndex = (req, res, next) => {
  return res.redirect('/recording')
}

exports.getLogin = async (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    return res.render('pages/login')
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
  }
}

exports.postLogin = (req, res, next) => {
  req.body.password = Buffer.from(req.body.password, 'base64').toString()
  return passport.authenticate('local-login', async (err, user) => {
    try {
      if (err) {
        return next(err)
      }
      return req.login(user, async (loginError) => {
        if (loginError) {
          const error = new Error()
          error.message = 'Có lỗi, vui lòng thử lại!'
          error.statusCode = 400
          return next(error)
        }
        return res.redirect('/')
      })
    } catch (error) {
      console.log("Đăng nhập bị lỗi", error)
      return next(error)
    }
  })(req, res, next)
}

exports.logout = (req, res, next) => {
  req.logout()
  req.session.destroy()
  return res.redirect('/login')
}