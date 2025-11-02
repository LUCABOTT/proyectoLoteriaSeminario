const db = require('../../configuracion/db');
const { DataTypes } = require('sequelize');

const telefonosusuarios= db.define(
  'telefonosusuarios',
  {
   id:{
    type: DataTypes.BIGINT,
    allowNull:false,
    primaryKey: true,
    autoIncrement: true
   },
   numero: {
    type: DataTypes.INTEGER,
    allowNull:false,
   },
  
   idUsuario:{
    type: DataTypes.BIGINT,
    allowNull:false
   },
   
  },
  {
    tableName: 'telefonosusuarios',
    timestamps: false // sin createdAt / updatedAt
  }
);

module.exports = telefonosusuarios;
