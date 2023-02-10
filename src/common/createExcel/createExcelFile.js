const zipFolder = require('zip-folder')
const path = require('path')
const Excel = require('exceljs')
const _async = require('async')
const fsx = require('fs.extra')
const moment = require('moment')
var templateExcel = require('./templateExcel')
var headerTable = require('./headerTable')
var setWeightColumnTable = require('./weightColumnTable')
var dataTable = require('./dataTable')
var sumRow = require('./sumRow')

/**
 * * Xin chao
 * @param {*} req 
 * @param {*} startTime Thời gian tìm dữ liêu
 * @param {*} endTime Thời gian Tìm dữ liệu
 * @param {*} titleTable Tên của bảng
 * @param {*} excelHeader Object config dùng để map các dữ liệu vào cột
 * @param {*} titlesHeader Tiêu đề của cột
 * @param {*} data Dữ liệu
 * @param {*} sumRows Tính tổng dữ liệu
 * @param {*} opts Các option tùy chọn
 * @param {*} callback
 * @returns
 */
function createExcelFile(
  {
    startTime = null,
    endTime = null,
    titleTable = null,
    excelHeader = null,
    titlesHeader = {},
    data = null,
    sumRows = null,
    opts = null,
    titleSheet = null
  },
  callback
) {
  try {
    if (data === null || data.length <= 0) {
      var error = new Error('Không có dữ liệu để xuất ra file Excel !')
      return callback(error)
    }

    var currentDate = new Date()
    var createFileAt = moment().format('HH-mm DD-MM-YYYY')

    var folderName = `${currentDate.getTime()}`
    var fileName = `${titleTable}_${createFileAt}_${currentDate.getTime()}`

    var fileNameExcel = path.join(_rootPath, 'public', 'export', 'cdr', folderName, fileName + '.xlsx')
    var folderPath = path.join(_rootPath, 'public', 'export', 'cdr', folderName)
    var folderZip = path.join(_rootPath, 'public', 'export', 'archiver', folderName + '.zip')

    var workbook = new Excel.Workbook()
    var sheet = workbook.addWorksheet(titleSheet)

    workbook.created = new Date()

    _async.waterfall([
      // Tạo thư mục chứa file excel
      function (next) {
        fsx.mkdirs(folderPath, function (err) {
          return next(err)
        })
      },
      // Tạo thư mục chứa file nén của excel
      function (next) {
        fsx.mkdirs(path.join(_rootPath, 'public', 'export', 'archiver'), function (err) {
          return next(err)
        })
      },
      // Tạo thư mục chứa danh sách thư mục của file excel
      function (next) {
        fsx.mkdirs(path.join(_rootPath, 'public', 'export', 'cdr'), function (err) {
          return next(err)
        })
      },
      // Set chiều rộng cho các cột trong bảng
      function (next) {
        setWeightColumnTable(sheet, opts, function (err, sheetResult) {
          next(err, sheetResult)
        })
      },
      // Tạo giao diện cho file excel
      function (sheet, next) {
        templateExcel(startTime, endTime, titleTable, sheet, opts, function (err, sheetResult) {
          next(err, sheetResult)
        })
      },
      // Tạo tiêu đề cho bảng
      function (sheet, next) {
        headerTable(sheet, excelHeader, titlesHeader, data, opts, function (err, sheetResult) {
          next(err, sheetResult)
        })
      },
      // Tạo bảng
      function (sheet, next) {
        dataTable(data, excelHeader, sheet, opts, function (err, sheetResult) {
          next(err, sheetResult)
        })
      },
      // Tạo Dòng tính tổng
      function (sheet, next) {
        if (!sumRows || sumRows == null || sumRows <= 0) {
          return next(null)
        }
        sumRow(sumRows, excelHeader, sheet, function (err) {
          next(err)
        })
      },
      // Ghi dữ liệu vào file excel
      function (next) {
        workbook.xlsx.writeFile(fileNameExcel).then(function (err) {
          next(err)
        })
      },
      // Nén file excel
      function (next) {
        zipFolder(folderPath, folderZip, function (err) {
          next(err, folderZip)
        })
      },
    ], function (err, result) {
      return callback(err, result.replace(path.join(_rootPath, 'public'), ''))
    })
  } catch (error) {
    return callback(error)
  }
};

module.exports = createExcelFile