const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../database/database.json')[env];

const UserModel = require('../models/user');
const TeamModel = require('./team');
const AgentTeamMemberModel = require('./agentTeamMember');
const CallDetailRecordsModel = require('./call_detail_records');
const UserRoleModel = require('./userRole');
const Configurationcolums = require('./configurationcolums');
const GroupModel = require('./group');
const TeamGroupModel = require('./teamGroup');
const UserGroupMemberModel = require('./userGroupMember');
const RuleTypeModel = require('./ruleType');
const RuleModel = require('./rule');
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
  CallDetailRecords: CallDetailRecordsModel.init(sequelize),
  UserRole: UserRoleModel.init(sequelize),
  ConfigurationColums: Configurationcolums.init(sequelize),
  Group: GroupModel.init(sequelize),
  TeamGroup: TeamGroupModel.init(sequelize),
  UserGroupMember: UserGroupMemberModel.init(sequelize),
  RuleType: RuleTypeModel.init(sequelize),
  Rule: RuleModel.init(sequelize),
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
