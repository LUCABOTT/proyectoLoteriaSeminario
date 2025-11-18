const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');

const DetalleTicket = db.define('DetalleTicket', {
  IdDetalle: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  IdTicket: { type: DataTypes.BIGINT, allowNull: false },
  NumeroComprado: { type: DataTypes.INTEGER, allowNull: false },
  Subtotal: { type: DataTypes.DECIMAL(10,2), allowNull: false }
}, {
  tableName: 'DetalleTicket',
  timestamps: false
});

module.exports = DetalleTicket;
