const { Sequelize } = require("sequelize");

const USUARIO = process.env.USUARIO || "root";
const CONTRASENA = process.env.CONTRASENA || "12345";
const DB = process.env.DB || "proyectoseminario";

const database = new Sequelize(DB, USUARIO, CONTRASENA, {
  dialect: "mysql",
  host: "localhost",
  logging: false,
});

module.exports = database;
