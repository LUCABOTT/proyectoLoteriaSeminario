const { DataTypes } = require("sequelize");
const database = require("../configuracion/db");

const Transaccion = database.define(
  "Transaccion",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    billetera: { type: DataTypes.INTEGER, allowNull: false },
    monto: { type: DataTypes.DECIMAL, allowNull: false },
    ticket: { type: DataTypes.BIGINT, allowNull: true },
    tipo: {
      type: DataTypes.ENUM("Recarga", "Pago", "Reembolso", "Compra de ticket"),
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
