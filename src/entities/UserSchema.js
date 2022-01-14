const EntitySchema = require('typeorm').EntitySchema;
const moment = require('moment');
module.exports = new EntitySchema({
  name: 'Users',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    firstName: {
      type: 'varchar',
    },
    lastname: {
      type: 'varchar'
    },
    username: {
      type: 'varchar'
    },
    extension: {
      type: 'int'
    },
    password: {
      type: 'varchar'
    },
    createAt: {
      type: 'datetime',
      default: moment(Date.now()).format('DD/MM/YYYY HH:mm:ss')
    },
    createBy: {
      type: 'varchar',
      default: 'admin'
    },
    role: {
      type: 'bit',
      default: 0, // 0: User || 1: Admin
    }
  }
});