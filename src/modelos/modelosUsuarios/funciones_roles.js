const db = require('../../configuracion/db');
const { DataTypes } = require('sequelize');
const Funciones = require('./funciones');
const Roles = require('./roles');

const FuncionesRoles = db.define(
  'funciones_roles',
  {
    rolescod: {
      type: DataTypes.STRING(128),
      allowNull: false,
      references: {
        model: Roles,
        key: 'rolescod'
      }
    },
    fncod: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: Funciones,
        key: 'fncod'
      }
    },
    fnrolest: {
      type: DataTypes.ENUM('AC', 'IN', 'BL'),
      allowNull: true,
      defaultValue: 'AC'
    },
    fnexp: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'funciones_roles',
    timestamps: false,
    indexes: [
      { name: 'rol_funcion_key_idx', fields: ['fncod'] }
    ]
  }
);

// Llave compuesta
FuncionesRoles.removeAttribute('id');
FuncionesRoles.primaryKeyAttributes = ['rolescod', 'fncod'];

module.exports = FuncionesRoles;