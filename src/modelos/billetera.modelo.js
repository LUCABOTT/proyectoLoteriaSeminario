const { DataTypes } = require("sequelize");
const database = require("../configuracion/db");

const Billetera = database.define(
  "Billetera",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario: { type: DataTypes.INTEGER, allowNull: false },
    saldo: { type: DataTypes.DECIMAL, defaultValue: 0 },
    estado: {
      type: DataTypes.ENUM("Activa", "Congelada"),
      defaultValue: "Activa",
    },
  },
  {
    tableName: "billeteras",
    timestamps: true,
    createdAt: "creada",
    updatedAt: "actualizada",
    underscored: true,
  },
);

module.exports = Billetera;
