const EntitySchema = require('typeorm').EntitySchema;

module.exports = new EntitySchema({
  name: 'Users',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    firstName: {
      type: 'varchar'
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
    role: {
      type: 'bit',
      default: 0, // 0: User || 1: Admin
    }
  }
})