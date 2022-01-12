var { objectSize, columnToLetter } = require('../functions/until');
var { fonts } = require('./style');

function dataTable(data, excelHeader, sheet, { dataCustomize = '' }, callback) {
  try {

    // Data là một Array
    if (dataCustomize === '' && Array.isArray(data)) {
      data.forEach((el) => {
        let rowData = [];
        let size = objectSize(excelHeader);

        Object.keys(excelHeader).map((key) => {
          rowData.push(el[excelHeader[key]])
        });
        sheet.addRow(rowData);

        for (let i = 1; i <= size; i++) {
          let charNameColumn = columnToLetter(i);
          sheet.lastRow.getCell(charNameColumn).border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
          }
          sheet.lastRow.getCell(charNameColumn).font = { family: 4, name: fonts.primary, size: 10 };
          sheet.lastRow.getCell(charNameColumn).alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });

      return callback(null, sheet);
    }

    // Data là một Object
    if (dataCustomize === '' && !Array.isArray(data)) {
      let rowData = [];
      let size = objectSize(excelHeader);

      Object.keys(excelHeader).map((key) => {
        rowData.push(data[excelHeader[key]])
      });
      sheet.addRow(rowData);

      for (let i = 1; i <= size; i++) {
        let charNameColumn = columnToLetter(i);
        sheet.lastRow.getCell(charNameColumn).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        }
        sheet.lastRow.getCell(charNameColumn).font = { family: 4, name: fonts.primary, size: 10 };
        sheet.lastRow.getCell(charNameColumn).alignment = { vertical: 'middle', horizontal: 'center' };
      }

      return callback(null, sheet);
    }

    // Customize dữ liệu với từng loại báo cáo
    if (dataCustomize !== '') {
      var pathHeadCustomize = path.join(_rootPath, 'commons', 'createExcel', 'customize', 'dataTable', `${dataCustomize}.js`)
      var createDataTable = require(pathHeadCustomize);
      createDataTable(data, excelHeader, sheet, function (error, sheetResult) {
        return callback(error, sheetResult);
      });
    }
  } catch (error) {
    return callback(error);
  }
}

module.exports = dataTable;