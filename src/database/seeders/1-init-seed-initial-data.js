'use strict'

const users = [
  { id: 1, firstName: 'admin', lastName: 'admin', userName: 'admin', fullName: 'admin', extension: 0 }
]

const userRole = [
  { userId: 1, role: 2 }
]

const teams = [
  { id: 1, name: 'Default', description: 'Đây là nhóm mặc định', created: 1, status: 1 },
]


module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const newUsers = users.map((user) => {
        return {
          ...user,
          password: '123456aA@',
          created: 1,
          isAvailable: 0,
          isActive: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      const newUserRole = userRole.map((role) => {
        return {
          ...role,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      const newTeam = teams.map((team) => {
        return {
          ...team,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      await queryInterface.bulkInsert('Users', newUsers, {}, { 'id': { autoIncrement: true } })

      await queryInterface.bulkInsert('UserRoles', newUserRole, {})

      await queryInterface.bulkInsert('Teams', newTeam, {}, { 'id': { autoIncrement: true } })

    } catch (error) {
      console.log("Run seeders error", error)
    }
  }
}
