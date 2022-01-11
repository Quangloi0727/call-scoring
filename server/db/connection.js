const { MongoClient } = require('mongodb');

const { DATABASE, DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_RS_Name } = process.env;

let initDB = async (
  host = DB_HOST,
  port = DB_PORT,
  user = DB_USER,
  pass = DB_PASS,
  database = DATABASE,
  RS_Name = DB_RS_Name
) => {
  try {
    let path = pathDB(host, port, database, user, pass, RS_Name);
    console.log("connect", path);
    const cliend = await MongoClient.connect(path);
    return cliend.db(DATABASE);
  } catch (error) {
    throw error;
  }
};

function pathDB(host, port, database, user, pass, RS_Name) {
  let path = `mongodb://${host}:${port}/${database}`;
  if (user !== "#" && pass !== "#") {
    path = `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(
      pass
    )}@${host}:${port}/${database}`;
    if (RS_Name != "#") {
      path = `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(
        pass
      )}@${host.split(',').map(i => `${i}:${port}`)}/${database}?replicaSet=${RS_Name}`;
    }
  }

  return path;
};

module.exports = {
  initDB,
}