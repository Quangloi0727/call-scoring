'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * @todo
     * check table exists
     *  - true: add column
     *  - false: createTable
     *    + add column, foreignKey 
     * 
     * 
     */
    const tableName = 'call_detail_records';
    const defaultTeamId = 1;

    let tableIsExists = await queryInterface.describeTable(tableName)
    .then(tableDefinition => {
      console.log('co vao day', tableDefinition);
      return tableDefinition.id ? Promise.resolve(true): Promise.resolve(false);
    }).catch(err => Promise.resolve(false));

    // check ton tai column id
    if(tableIsExists){
      console.log('table exists!', tableIsExists);
      
      // add column
      // update teamId default --> column
      await Promise.all([
        queryInterface.addColumn(
          tableName,
          'agentId',
          { 
            type: Sequelize.INTEGER,
            references: { model: 'Users', key: 'id' } 
          } // or a different column
        ),
        queryInterface.addColumn(
          tableName,
          'teamId',
          { 
            type: Sequelize.INTEGER,
            references: { model: 'Teams', key: 'id' } 
          } // or a different column
        )
      ])
      await queryInterface.sequelize.query(`UPDATE ${tableName} SET teamId = ${defaultTeamId}`);
      
    }else {
      console.log('table not exists!', tableIsExists);
      await queryInterface.createTable(tableName, {
        id: {
          allowNull: false,
          autoIncrement: false,
          primaryKey: true,
          type: 'UNIQUEIDENTIFIER'
        },
        callId: {
          type: Sequelize.BIGINT
        },
        called: {
          type: Sequelize.STRING(25)
        },
        caller: {
          type: Sequelize.STRING(25)
        },
        connectTime: {
          type: Sequelize.BIGINT
        },
        destLegId: {
          type: Sequelize.BIGINT
        },
        direction: {
          type: Sequelize.STRING(50)
        },
        disconnectTime: {
          type: Sequelize.BIGINT
        },
        duration: {
          type: Sequelize.INTEGER
        },
        fileStatus: {
          type: Sequelize.STRING(50)
        },
        origCalledLoginUserId: {
          type: Sequelize.STRING(50)
        },
        origCallingLoginUserId: {
          type: Sequelize.STRING(50)
        },
        origLegId: {
          type: Sequelize.BIGINT
        },
        origTime: {
          type: Sequelize.BIGINT
        },
        teamId: {
          type: Sequelize.INTEGER,
          references: { model: 'Users', key: 'id' }
        },
        agentId: {
          type: Sequelize.INTEGER,
          references: { model: 'Teams', key: 'id' }
        },
        recordingFileName: {
          type: Sequelize.STRING(100)
        }
      },{
        quoteIdentifiers: false, // set case-insensitive
      });
    }
   
  },
  async down(queryInterface, Sequelize) {
    // await queryInterface.dropTable('call_detail_records');
  }
};