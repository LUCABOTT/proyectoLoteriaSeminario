const db = require('../../configuracion/db');
const { DataTypes } = require('sequelize');
const Usuario = require('./usuarios');
const Roles = require('./roles');

const RolesUsuarios = db.define(
  'roles_usuarios',
  {
    usercod: {
      type: DataTypes.BIGINT(10),
      allowNull: false,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    rolescod: {
      type: DataTypes.STRING(128),
      allowNull: false,
      references: {
        model: Roles,
        key: 'rolescod'
      }
    },
    roleuserest: {
      type: DataTypes.ENUM('AC', 'IN', 'BL'),
      allowNull: true,
      defaultValue: 'AC'
    },
    roleuserfch: {
      type: DataTypes.DATE,
      allowNull: true
    },
    roleuserexp: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'roles_usuarios',
    timestamps: false,
    indexes: [
      { name: 'rol_usuario_key_idx', fields: ['rolescod'] }
    ]
  }
);

// Llave primaria compuesta
RolesUsuarios.removeAttribute('id');
RolesUsuarios.primaryKeyAttributes = ['usercod', 'rolescod'];

module.exports = RolesUsuarios;