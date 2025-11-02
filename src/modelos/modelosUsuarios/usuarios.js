const db = require('../../configuracion/db');
const { DataTypes } = require('sequelize');

const usuarios= db.define(
  'usuarios',
  {
   id:{
    type: DataTypes.BIGINT,
    allowNull:false,
    primaryKey: true,
    autoIncrement: true
   },
   primerNombre: {
      type: DataTypes.STRING(50),
      allowNull: true
       
    },
    segundoNombre: {
      type: DataTypes.STRING(50),
      allowNull: true
       
    },
    primerApellido: {
      type: DataTypes.STRING(50),
      allowNull: true
      
    },
    segundoApellido: {
      type: DataTypes.STRING(50),
      allowNull: true
       
    },
    identidad: {
      type: DataTypes.STRING(50),
      allowNull: true
       
    },
    useremail: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
      validate: {
            isEmail: true,  // valida formato de correo
             },
      comment: 'EMAIL DEL USUARIO Y UNIQUE PARA EVITAR CORREO DUPLICADOS'
    },
    userpswd: {
      type: DataTypes.STRING(128),
      allowNull: false,
      comment: 'Contraseña del usuario, se espera que esté encriptada o hasheada'
    },
    userfching: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de ingreso del usuario al sistema, útil para auditoría o seguimiento'
    },
   userest: {
      type: DataTypes.ENUM('AC', 'IN', 'BL'),
      allowNull: true,
      defaultValue: 'AC',
      comment: 'Estado general del usuario: ACT, INA, BLQ'
    },
    userpswdexp: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de expiración de la contraseña'
    },
    useractcod: {
      type: DataTypes.STRING(128),
      allowNull: true,
      comment: 'Código de activación (confirmación de correo)'
    },
   usertipo: {
      type: DataTypes.ENUM('PBL', 'ADM', 'VND', 'AUD'),
      allowNull: true,
      defaultValue: 'PBL',
      comment: 'Tipo de Usuario: PBL, ADM, VND(Vendedor pulperia) o AUD'
    },
    fechaNacimiento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
  },
  {
    tableName: 'usuarios',
    timestamps: false // sin createdAt / updatedAt
  }
);

module.exports = usuarios;
