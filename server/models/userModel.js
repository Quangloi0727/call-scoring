const ObjectID = require('mongodb').ObjectID;

exports.getUser = async (db, Model, query, opt) => {
  try {
    const doc = await db.collection(Model).findOne(query);
    return doc;
  } catch (error) {
    throw new Error(error);
  }
}

exports.createUser = async (db, Model, query) => {
  try {
    const doc = await db.collection(Model).insertOne(query);
    return doc;
  } catch (error) {
    throw new Error(error);
  }
}