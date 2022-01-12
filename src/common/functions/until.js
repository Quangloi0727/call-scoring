function objectSize(object) {
  let size = 0;
  let key;
  for (key in object) {
    if (object.hasOwnProperty(key)) size++;
  }
  return size;
}

function columnToLetter(column) {
  var temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

module.exports = {
  objectSize,
  columnToLetter,
};