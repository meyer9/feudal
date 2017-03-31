const Sequelize = require('sequelize')

module.exports = new Sequelize('feudal' + (process.env.NODE_ENV || 'dev'), process.env.DBUSER || 'root', process.env.DBPASS)
