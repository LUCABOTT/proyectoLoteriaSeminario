const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');

const Tickets = db.define('Tickets', {
  IdTicket: { 
    type: DataTypes.BIGINT, 
    primaryKey: true, 
    autoIncrement: true 
  },
  IdUsuario: { 
    type: DataTypes.BIGINT, 
    allowNull: false 
  },
  IdSorteo: { 
    type: DataTypes.BIGINT, 
    allowNull: false 
  },
  FechaCompra: { 
    type: DataTypes.DATE, 
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Total: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  Estado: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'ganador', 'ganador_pagado', 'cancelado', 'reembolsado', 'anulado'),
    allowNull: false,
    defaultValue: 'pagado'
  }
}, { tableName: 'Tickets', timestamps: false });

module.exports = Tickets;
