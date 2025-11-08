const { DataTypes } = require("sequelize");
const database = require("../configuracion/db");

const Transaccion = database.define(
  "Transaccion",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    billetera: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    monto: { type: DataTypes.DECIMAL, allowNull: false },
    tipo: {
      type: DataTypes.ENUM("Recarga", "Pago", "Reembolso"),
      allowNull: false,
    },
  },
  {
    tableName: "transacciones",
    timestamps: true,
    createdAt: "creada",
    updatedAt: "actualizada",
    underscored: true,
  },
);

module.exports = Transaccion;
