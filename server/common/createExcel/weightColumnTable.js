function setWeightColumnTable(
  sheet,
  { valueWidthColumn = [20, 20, 50, 20, 20, 20, 20, 20, 20, 20] },
  callback
) {
  try {
    valueWidthColumn.forEach((item, index) => {
      sheet.getColumn(++index).width = item;
    });

    return callback(null, sheet);
  } catch (error) {
    return callback(error);
  }
}

module.exports = setWeightColumnTable;