
const pagesModel = require('../../models/pagesModel');
const {
  SUCCESS_200,
  ERR_400,
  ERR_404,
} = require('../../helpers/constants/statusCodeHTTP');

const { PAGES_COLLECTION } = process.env;

exports.getPagesActive = async (req, res, next) => {
  try {
    let mongoDB = req.app.locals.mongoDB;

    let result = await pagesModel.getPagesActive(mongoDB, PAGES_COLLECTION);

    return res.status(SUCCESS_200.code).json({ data: result });

  } catch (error) {
    console.log(`------- error ------- `);
    console.log(error);
    console.log(`------- error ------- `);
    return res.status(ERR_404.code).json({ data: [] });
  }
}