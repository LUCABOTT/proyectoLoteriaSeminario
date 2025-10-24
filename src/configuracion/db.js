const { Sequelize } = require('sequelize');

// Variables de entorno (asegúrate de definirlas en tu .env)
const USUARIO = process.env.USUARIO || '';
const CONTRASENA = process.env.CONTRASENA || '';
const DB = process.env.DB || '';

const db = new Sequelize(DB, USUARIO, CONTRASENA, {
  host: 'localhost',
  port: 3306, // puerto por defecto de MySQL
  dialect: 'mysql'
});

module.exports = db;


module.export = db