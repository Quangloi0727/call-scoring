const { objectSize, columnToLetter } = require('../functions/until');
var { colors, fonts } = require('./style');

function sumRow(sumRows, excelHeader, sheet, callback) {
  try {
    let size = objectSize(excelHeader);

    sheet.addRow([]);
    sheet.addRow(sumRows);
    sheet.lastRow.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.lastRow.font = { family: 4, name: fonts.primary, size: 10, };
    for (let i = 1; i <= size; i++) {
      let charNameColumn = columnToLetter(i);
      sheet.lastRow.getCell(charNameColumn).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    }

    sheet.lastRow.getCell('A').fill = {
      type: 'gradient',
      gradient: 'path',
      center: { left: 0.5, top: 0.5 },
      stops: [
        { position: 0, color: colors.backgroundColorCellSum },
        { position: 1, color: colors.backgroundColorCellSum }
      ]
    };

    sheet.lastRow.getCell('A').font = {
      name: fonts.primary,
      family: 4,
      size: 10,
      bold: true,
      color: colors.textColorCellSum
    };

    sheet.lastRow.getCell('A').border = {
      top: { style: "thin", color: colors.backgroundColorCellSum },
      left: { style: "thin", color: colors.backgroundColorCellSum },
      bottom: { style: "thin", color: colors.backgroundColorCellSum },
      right: { style: "thin", color: colors.backgroundColorCellSum }
    };

    return callback(null, sheet);
  } catch (error) {
    return callback(error);
  }
}

module.exports = sumRow;