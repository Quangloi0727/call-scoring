const typeorm = require('typeorm');
const CallDetailRecordingSchema = require('../entities/CallDetailRecordSchema');
const UserSchema = require('../entities/UserSchema');
const UserModel = require('../models/userModel');

require('localenv');

module.exports = async function () {
  try {
    const connection = await typeorm.createConnection({
      type: 'mssql',
      host: process.env.MSSQL_HOST,
      port: Number(process.env.MSSQL_PORT),
      username: process.env.MSSQL_USER,
      password: process.env.MSSQL_PASS,
      database: process.env.MSSQL_DATABASE,
      entities: [
        CallDetailRecordingSchema,
        UserSchema
      ]
    });

    console.log('connect to MSSQL success!');

    // const userRepository = connection.getRepository(UserSchema);

    // const user = await userRepository.find();

    // if (!user) {
    //   const user = new UserModel(
    //     "admin",
    //     "admin",
    //     "admin",
    //     0,
    //     "123",
    //     1
    //   );

      
    // }

  } catch (error) {
    console.log(`------- error ------- connect to MSSQL fail!`);
    console.log(error);
    console.log(`------- error ------- connect to MSSQL fail!`);
  }
}

async function initialData(connection) {
  try {

  } catch (error) {
    console.log(`------- error ------- initialData`);
    console.log(error);
    console.log(`------- error ------- initialData`);
  }
}