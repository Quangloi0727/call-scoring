const { query } = require("express")
const ObjectID = require("mongodb").ObjectID;

const APIFeatures = require("../utils/apiFeatures");
const { lowerCaseFirstLetter, baseHttpIP } = require("../helpers/functions");

exports.getAll = async (db, Model, query, opt) => {
  try {
    let _query = {};

    _query.is_deleted = { $ne: true };

    const count = await db.collection(Model).count(_query);
    if (count === 0) return {
      count,
      page: 0,
      data: []
    }

    const AllData = new APIFeatures(
      db.collection(Model).find(_query),
      query
    );

    const features = AllData.sort().paginate();
    let doc = await features.query.toArray();
    const { page, limit, extra } = features.queryString;

    doc = handleResult(doc, getBaseByModal(Model));
    if (extra) {
      const docExtra = await this.addExtra(db, Model, doc, extra);

      return {
        count,
        page,
        data: docExtra,
      };
    }
    return {
      count,
      page,
      data: doc,
    }
  } catch (error) {
    throw new Error(error);
  }
}

exports.create = async (db, Model, query, opt) => {
  try {
    const doc = await db.collection(Model).insertOne({
      ...query,
      is_deleted: false,
      created_at: (new Date()),
    })
    return { data: doc }
  } catch (error) {
    throw new Error(error);
  }
}

exports.getByID = async (db, Model, id) => {
  try {
    const doc = await db.collection(Model).findOne({ _id: ObjectID(id) });
    return doc;
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateByID = async (db, Model, id, query) => {
  try {
    const doc = await db.collection(Model).findOneAndUpdate(
      { _id: ObjectID(id) },
      {
        $set: {
          ...query,
        }
      }
    )
    return doc;
  } catch (error) {
    throw new Error(error);
  }
}

exports.changeActive = async (db, Model, query) => {
  try {
    const doc = await db.collection(Model).findOneAndUpdate(
      { _id: ObjectID(query._id) },
      {
        $set: {
          active: query.active,
        }
      }
    )
    return doc;
  } catch (error) {
    throw new Error(error);
  }
}

exports.deleteByID = async (db, Model, id) => {
  try {
    const doc = await db.collection(Model).findOneAndUpdate({ _id: ObjectID(id) },
      {
        $set: {
          is_deleted: true,
        }
      });
    return doc;
  } catch (error) {
    throw new Error(error);
  }
}

exports.getPagesActive = async (db, Model, query) => {
  try {
    let _query = {};

    _query.active = { $eq: 'true' };
    _query.is_deleted = { $ne: true };

    const doc = await db.collection(Model).find(_query).toArray();
    return doc;
  } catch (error) {
    throw new Error(error);
  }
}

const getBaseByModal = (Model) => {
  let __base_modal = '';
  __base_modal = lowerCaseFirstLetter(Model);

  return __base_modal;
}

function handleResult(result, baseByModal) {
  let r;
  if (Array.isArray(result)) {
    r = result.map(i => {

      if (i.link && i.link !== '') i.link = `${baseHttpIP()}/static/${baseByModal}/${i.link}`
      if (!i.link && ['ads', 'nghiDinh', 'setting'].includes(baseByModal)) {
        if (i.link === '') {
          i.link = '';
        } else i.link = `${baseHttpIP()}/static/${baseByModal}/default.jpg`

      }
      return i;
    });

  } else {
    r = { ...result };
  }

  return r;
}