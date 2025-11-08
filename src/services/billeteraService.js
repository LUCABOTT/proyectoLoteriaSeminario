const db = require("../configuracion/db");
const Billetera = require("../modelos/billetera.modelo");
const Transaccion = require("../modelos/transaccion.modelo");

const asegurarBilletera = async (idUsuario, options = {}) => {
  let billetera = await Billetera.findOne({ where: { usuario: idUsuario }, ...options });
  if (!billetera) {
    billetera = await Billetera.create({ usuario: idUsuario, saldo: 0 }, options);
  }
  return billetera;
};

const obtenerSaldo = async (idUsuario) => {
  const billetera = await asegurarBilletera(idUsuario);
  return parseFloat(billetera.saldo || 0);
};

const acreditar = async (idUsuario, monto, tipo = "Recarga", options = {}) => {
  if (Number(monto) <= 0) throw new Error("El monto a acreditar debe ser mayor que 0");

  if (options.transaction) {
    const billetera = await asegurarBilletera(idUsuario, { transaction: options.transaction });
    billetera.saldo = parseFloat(billetera.saldo || 0) + parseFloat(monto);
    await billetera.save({ transaction: options.transaction });
    await Transaccion.create({ billetera: billetera.id, monto, tipo }, { transaction: options.transaction });
    return billetera;
  }

  return await db.transaction(async (t) => {
    const billetera = await asegurarBilletera(idUsuario, { transaction: t });
    billetera.saldo = parseFloat(billetera.saldo || 0) + parseFloat(monto);
    await billetera.save({ transaction: t });
    await Transaccion.create({ billetera: billetera.id, monto, tipo }, { transaction: t });
    return billetera;
  });
};

const debitar = async (idUsuario, monto, tipo = "Pago", options = {}) => {
  if (Number(monto) <= 0) throw new Error("El monto a debitar debe ser mayor que 0");

  if (options.transaction) {
    const billetera = await asegurarBilletera(idUsuario, { transaction: options.transaction });
    const actual = parseFloat(billetera.saldo || 0);
    if (actual < parseFloat(monto)) throw new Error("Saldo insuficiente");
    billetera.saldo = actual - parseFloat(monto);
    await billetera.save({ transaction: options.transaction });
    await Transaccion.create({ billetera: billetera.id, monto, tipo }, { transaction: options.transaction });
    return billetera;
  }

  return await db.transaction(async (t) => {
    const billetera = await asegurarBilletera(idUsuario, { transaction: t });
    const actual = parseFloat(billetera.saldo || 0);
    if (actual < parseFloat(monto)) throw new Error("Saldo insuficiente");
    billetera.saldo = actual - parseFloat(monto);
    await billetera.save({ transaction: t });
    await Transaccion.create({ billetera: billetera.id, monto, tipo }, { transaction: t });
    return billetera;
  });
};

module.exports = {
  asegurarBilletera,
  obtenerSaldo,
  acreditar,
  debitar,
};
