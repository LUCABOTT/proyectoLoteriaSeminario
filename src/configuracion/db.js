const { Sequelize } = require("sequelize");

const USUARIO = process.env.USUARIO || "";
const CONTRASENA = process.env.CONTRASENA || "";
const DB = process.env.DB || "";

const database = new Sequelize(DB, USUARIO, CONTRASENA, {
  dialect: "mysql",
  host: "localhost",
  logging: false,
});

module.exports = database;
