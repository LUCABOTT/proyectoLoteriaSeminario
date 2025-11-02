const db = require('../../configuracion/db');
const { DataTypes } = require('sequelize');

const imagenesUsuarios = db.define(
  'imagenesUsuarios',
  {
   id:{
    type: DataTypes.BIGINT,
    allowNull:false,
    primaryKey: true,
    autoIncrement: true
   },

    url:{
        type:DataTypes.STRING(250),
        allowNull:false,
    },
     usuarioId:{
    type: DataTypes.BIGINT,
    allowNull:false
   }
   
  },
  {
    tableName: 'imagenesUsuarios',
    timestamps: false // sin createdAt / updatedAt
  }
);

module.exports = imagenesUsuarios;
