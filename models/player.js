const Sequelize = require('sequelize')
const sequelize = require('../database')

const User = sequelize.define('player', {
  name: Sequelize.STRING,
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  leader: Sequelize.UUID,
  money: Sequelize.INTEGER,
  token: Sequelize.INTEGER,
  verified: {
    type: Sequelize.BOOLEAN,
    default: false
  }
})

User.sync()

module.exports = User
