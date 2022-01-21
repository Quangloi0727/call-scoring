const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../database/database.json')[env];

const UserModel = require('../models/user');
const TeamModel = require('./team');
const AgentTeamMemberModel = require('./agentTeamMember');
const CallDetailRecordsModel = require('./call_detail_records');

let db = {};
let sequelize = null;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const models = {
  User: UserModel.init(sequelize),
  Team: TeamModel.init(sequelize),
  AgentTeamMember: AgentTeamMemberModel.init(sequelize),
  call_detail_records: CallDetailRecordsModel.init(sequelize),
}

Object.keys(models).forEach(model => {
  if (typeof models[model].associate === "function") {
    models[model].associate(models)
  }
});

db = {
  ...models,
  sequelize: sequelize,
  Sequelize: Sequelize,
}

module.exports = db;
