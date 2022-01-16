const { createConnection } = require('typeorm');
const UserSchema = require('../entities/UserSchema');

require('localenv');

module.exports = async function () {
  try {
    const connection = await createConnection({
      type: 'mssql',
      host: process.env.MSSQL_HOST,
      port: Number(process.env.MSSQL_PORT),
      username: process.env.MSSQL_USER,
      password: process.env.MSSQL_PASS,
      database: process.env.MSSQL_DATABASE,
      entities: [
        UserSchema
      ],
    });

    console.log('connect to MSSQL success!');

    return initialData(connection);
  } catch (error) {
    console.log(`------- error ------- connect to MSSQL fail!`);
    console.log(error);
    console.log(`------- error ------- connect to MSSQL fail!`);
  }
}

/**
 * Kiểm tra Admin có tồi tại hay không. Nếu không có, sẽ tạo mới!
 */
async function initialData(connection) {
  try {
    const userRepository = connection.getRepository(UserSchema);

    const user = await userRepository.findOne({ username: 'admin' });

    if (!user) {
      connection.createQueryBuilder()
        .insert()
        .into(UserSchema)
        .values({
          firstName: 'admin',
          lastname: 'admin',
          username: 'admin',
          extension: 0,
          password: '123',
          role: 1
        })
        .execute();
    } else {
      console.log('admin ton tai!');
    }
  } catch (error) {
    throw new Error(error);
  }
}