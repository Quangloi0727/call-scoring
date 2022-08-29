
/**
 * Computed the boundaries limits and return them
 * @param minutes phút nhập vào
 * @param seconds giây nhập vào
 */

function refactorTimeToMinutes(minutes, seconds) {
  let _minutes = parseInt(minutes)
  let _seconds = parseInt(seconds)
  var temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

module.exports = {
  refactorTimeToMinutes,
};