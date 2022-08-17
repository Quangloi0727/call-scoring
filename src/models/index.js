const Sequelize = require('sequelize')
const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../database/database.json')[env]

const UserModel = require('../models/user')
const TeamModel = require('./team')
const AgentTeamMemberModel = require('./agentTeamMember')
const CallDetailRecordsModel = require('./call_detail_records')
const UserRoleModel = require('./userRole')
const Configurationcolums = require('./configurationcolums')
const GroupModel = require('./group')
const TeamGroupModel = require('./teamGroup')
const UserGroupMemberModel = require('./userGroupMember')
const RuleTypeModel = require('./ruleType')
const RuleModel = require('./rule')
const RuleDetailModel = require('./ruleDetail')

const ScoreScriptsModel = require('./scoreScripts')
const ScoreTargetModel = require('./scoreTarget')
const ScoreTargetAutoModel = require('./scoreTargetAuto')
const ScoreTargetCondModel = require('./scoreTargetCond')
const ScoreTargetKeywordSetModel = require('./scoreTargetKeywordSet')
const ScoreTarget_ScoreScriptModel = require('./scoreTarget_scoreScript')
const ScoreTargetAssignmentModel = require('./scoreTargetAssignment')

const CriteriaGroupsModel = require('./criteriaGroups')
const CriteriasModel = require('./criterias')
const SelectionCriteriasModel = require('./selectionCriterias')

let db = {}
let sequelize = null

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config)
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
  RuleDetail: RuleDetailModel.init(sequelize),
  ScoreScript: ScoreScriptsModel.init(sequelize),

  ScoreTarget: ScoreTargetModel.init(sequelize), // mục tiêu chấm điểm
  ScoreTargetAuto: ScoreTargetAutoModel.init(sequelize),
  ScoreTargetCond: ScoreTargetCondModel.init(sequelize),
  ScoreTargetKeywordSet: ScoreTargetKeywordSetModel.init(sequelize),
  ScoreTarget_ScoreScript: ScoreTarget_ScoreScriptModel.init(sequelize),
  ScoreTargetAssignment: ScoreTargetAssignmentModel.init(sequelize),

  CriteriaGroup: CriteriaGroupsModel.init(sequelize),
  Criteria: CriteriasModel.init(sequelize),
  SelectionCriteria: SelectionCriteriasModel.init(sequelize),
}

Object.keys(models).forEach(model => {
  if (typeof models[model].associate === "function") {
    models[model].associate(models)
  }
})

db = {
  ...models,
  sequelize: sequelize,
  Sequelize: Sequelize,
}

module.exports = db
