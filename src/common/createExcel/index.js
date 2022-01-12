const createExcelFile = require('./createExcelFile');

function createExcelPromise({
  startTime,
  endTime,
  titleTable,
  excelHeader,
  titlesHeader,
  data,
  sumRows,
  opts,
}) {
  return new Promise((resolve, reject) => {
    createExcelFile({
      startTime,
      endTime,
      titleTable,
      excelHeader,
      titlesHeader,
      data,
      sumRows,
      opts,
    }, function (error, result) {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}

module.exports = {
  createExcelFile,
  createExcelPromise
};