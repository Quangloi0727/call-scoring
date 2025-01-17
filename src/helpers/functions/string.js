
const {
    DAU_CACH,
} = require('../constants');

exports.chuanHoaName = (name) => {
    let searchReg = new RegExp(DAU_CACH, "g");
    if (!name) return "";
    return name.trim().replace(searchReg, ' ');
};

exports.capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.lowerCaseFirstLetter = (string) => {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

exports.cheSo = (phone, num) => {
    if(phone && typeof phone == 'string'){
        let re = new RegExp(`.(?=.{${num}})`, 'g');
    
    return phone.replace(re, '*');
    }else return phone;
}