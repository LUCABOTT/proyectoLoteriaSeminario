const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');

const Juego = db.define('Juego', {
  Id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  Nombre: { type: DataTypes.STRING(100), allowNull: false },
  Descripcion: { type: DataTypes.STRING(255) },
  PrecioJuego: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  RangoMin: { type: DataTypes.INTEGER, allowNull: false },
  RangoMax: { type: DataTypes.INTEGER, allowNull: false },
  CantidadNumeros: { type: DataTypes.INTEGER, allowNull: false },
  PermiteRepetidos: { type: DataTypes.BOOLEAN, allowNull: false },
  ReglasResumen: { type: DataTypes.STRING(255) }
}, { tableName: 'Juego', timestamps: false });

module.exports = Juego;
