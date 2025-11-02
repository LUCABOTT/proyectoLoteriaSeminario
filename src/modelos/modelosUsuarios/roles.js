const db = require('../../configuracion/db');
const { DataTypes } = require('sequelize');

const Roles = db.define(
  'roles',
  {
    rolescod: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true
    },
    rolesdsc: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    rolesest: {
      type: DataTypes.ENUM('AC', 'IN', 'BL'),
      allowNull: true,
      defaultValue: 'AC'
    }
  },
  {
    tableName: 'roles',
    timestamps: false
  }
);

module.exports = Roles;