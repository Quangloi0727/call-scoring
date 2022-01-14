const { 
  EntitySchema, 
} = require('typeorm');

module.exports = new EntitySchema({
  name: 'Groups',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar'
    },
    description: {
      type: 'text'
    },
    createAt: {
      type: 'datetime'
    },
    updateAt: {
      type: 'datetime',
    },
    created: {
      type: 'int',
    }
  },
  relations: {
    created: {
      target: 'Users',
      type: 'one-to-many',
      joinTable: true,
      cascade: true
    }
  }
});