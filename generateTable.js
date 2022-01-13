const { createConnection } = require('typeorm');
const UserSchema = require('./src/entities/UserSchema');

require('localenv');

/**
 * function này có chức năng tạo bảng 
 */
async function generate() {
  try {
    await createConnection({
      type: 'mssql',
      host: process.env.MSSQL_HOST,
      port: Number(process.env.MSSQL_PORT),
      username: process.env.MSSQL_USER,
      password: process.env.MSSQL_PASS,
      database: process.env.MSSQL_DATABASE,
      synchronize: true,
      entities: [
        UserSchema
      ],
    });

    console.log('Tạo bảng thành công!');
  } catch (error) {
    console.log(`------- error ------- connect to MSSQL fail!`);
    console.log(error);
    console.log(`------- error ------- connect to MSSQL fail!`);
  }
}

generate();