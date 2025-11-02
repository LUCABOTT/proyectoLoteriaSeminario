const db = require('../../configuracion/db');
const { DataTypes } = require('sequelize');

const Funciones = db.define(
  'funciones',
  {
    fncod: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    fndsc: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Descripción de la función'
    },
    fnest: {
      type: DataTypes.ENUM('AC', 'IN', 'BL'),
      allowNull: true,
      defaultValue: 'AC',
      comment: 'Estado de la función: ACT, INA, etc.'
    },
    fntyp: {
      type: DataTypes.ENUM('PBL', 'ADM', 'VND', 'AUD'),
      allowNull: true,
      comment: 'Tipo de función: ADM, CLI, REP, etc.'
    }
  },
  {
    tableName: 'funciones',
    timestamps: false
  }
);

module.exports = Funciones;