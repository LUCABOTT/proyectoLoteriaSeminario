const { DataTypes } = require("sequelize");
const database = require("../configuracion/db");

const MetodoPago = database.define(
  "MetodoPago",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario: { type: DataTypes.INTEGER, allowNull: false },
    tipo: {
      type: DataTypes.ENUM("Tarjeta", "PayPal", "Efectivo"),
      allowNull: false,
    },
  },
  {
    tableName: "metodos_pago",
    timestamps: true,
    createdAt: "creada",
    updatedAt: "actualizada",
    underscored: true,
  },
);

module.exports = MetodoPago;
