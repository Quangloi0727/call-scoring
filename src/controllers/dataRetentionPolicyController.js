const titlePage = 'Chính sách dữ liệu'
const {
  TypeDateSaveForCall,
  UnlimitedSaveForCall
} = require('../helpers/constants/index')
exports.index = async (req, res, next) => {
  try {
    return _render(req, res, 'dataRetentionPolicy/index', {
      title: titlePage,
      titlePage: titlePage
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return next(error)
  }
}

exports.new = async (req, res, next) => {
  try {
    return _render(req, res, 'dataRetentionPolicy/new', {
      title: titlePage,
      titlePage: titlePage,
      TypeDateSaveForCall,
      UnlimitedSaveForCall
    })
  } catch (error) {
    console.log(`------- error ------- `)
    console.log(error)
    console.log(`------- error ------- `)
    return next(error)
  }
}