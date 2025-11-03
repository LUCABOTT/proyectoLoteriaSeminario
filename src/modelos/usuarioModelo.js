const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');

const Usuario = db.define('Usuario', {
  Id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  Nombre: { type: DataTypes.STRING(100), allowNull: false },
  Rol: { type: DataTypes.STRING(10) }
}, { tableName: 'Usuario', timestamps: false });

module.exports = Usuario;
