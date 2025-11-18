const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');

const Sorteo = db.define('Sorteo', {
  Id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  IdJuego: { type: DataTypes.BIGINT, allowNull: false },
  Cierre: { type: DataTypes.DATE, allowNull: false },
  Estado: {
    type: DataTypes.ENUM('abierto','cerrado','sorteado','anulado'),
    allowNull: false,
    defaultValue: 'abierto'
  },
  NumerosGanadores: { type: DataTypes.JSON, allowNull: true }
}, { tableName: 'Sorteo', timestamps: false });

module.exports = Sorteo;
