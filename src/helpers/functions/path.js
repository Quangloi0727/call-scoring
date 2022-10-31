const path = require("path");

exports.basename = (filename) => {
    let pathName = path.basename(filename);
    return pathName;
};
