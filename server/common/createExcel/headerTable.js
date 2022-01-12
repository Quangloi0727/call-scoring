var { objectSize, columnToLetter } = require('../functions/until');
var { colors, fonts } = require('./style');

function headerTable(
  sheet,
  excelHeader,
  titlesHeader,
  data,
  { headCustomize = '' },
  callback) {
  try {
    sheet.addRow([]);
    sheet.addRow([]);

    // Tự động tạo tiêu đề với cấu hình truyền vào
    if (headCustomize === '') {
      let rowHeader = []

      Object.keys(excelHeader).map((key) => {
        rowHeader.push(titlesHeader[key]);
      });

      sheet.addRow(rowHeader);
      sheet.lastRow.height = 25;
      sheet.lastRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      sheet.lastRow.font = { family: 4, name: fonts.primary, size: 12, bold: true, color: colors.textColorTitleTable };

      for (let i = 1; i <= rowHeader.length; i++) {
        let charNameColumn = columnToLetter(i);

        sheet.lastRow.getCell(charNameColumn).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };

        sheet.lastRow.getCell(charNameColumn).fill = {
          type: 'gradient',
          gradient: 'path',
          center: { left: 0.5, top: 0.5 },
          stops: [
            { position: 0, color: colors.backgroundColorTitleTable },
            { position: 1, color: colors.backgroundColorTitleTable }
          ]
        };
      }

      return callback(null, sheet);
    }

    // Customize tiêu đề với từng loại báo cáo
    if (headCustomize !== '') {
      var pathHeadCustomize = path.join(_rootPath, 'commons', 'createExcel', 'customize', 'headTable', `${headCustomize}.js`)
      var createHead = require(pathHeadCustomize);
      createHead(sheet, excelHeader, titlesHeader, data, function (error, sheetResult) {
        return callback(error, sheetResult);
      });
    }
  } catch (error) {
    return callback(error);
  }
}

module.exports = headerTable;