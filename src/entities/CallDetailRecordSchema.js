const EntitySchema = require('typeorm').EntitySchema;

module.exports = new EntitySchema({
  name: 'call_detail_records',
  columns: {
    id: {
      primary: true,
      type: 'uniqueidentifier'
    },
    callId: {
      type: 'bigint'
    },
    called: {
      type: 'varchar'
    },
    caller: {
      type: 'varchar'
    },
    connectTime: {
      type: 'bigint'
    },
    destLegId: {
      type: 'bigint'
    },
    direction: {
      type: 'varchar'
    },
    disconnectTime: {
      type: 'bigint'
    },
    duration: {
      type: 'int'
    },
    fileStatus: {
      type: 'varchar'
    },
    origCalledLoginUserId: {
      type: 'varchar'
    },
    origCallingLoginUserId: {
      type: 'varchar'
    },
    origLegId: {  
      type: 'bigint'
    },
    origTime: {
      type: 'bigint'
    },
    recordingFileName: {
      type: 'varchar'
    }
  }
})