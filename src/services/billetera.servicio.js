const db = require("../configuracion/db");
const Billetera = require("../modelos/billetera.modelo");
const Transaccion = require("../modelos/transaccion.modelo");

const asegurarBilletera = async (usuario, opciones = {}) => {
  let billetera = await Billetera.findOne({ where: { usuario }, ...opciones });
  if (!billetera) {
    billetera = await Billetera.create({ usuario, saldo: 0 }, opciones);
  }
  return billetera;
};

const obtenerSaldo = async (usuario) => {
  const billetera = await asegurarBilletera(usuario);
  return parseFloat(billetera.saldo || 0);
};

const acreditar = async (usuario, monto, tipo = "Recarga", opciones = {}) => {
  if (Number(monto) <= 0) throw new Error("El monto a acreditar debe ser mayor que 0");

  if (opciones.transaction) {
    const billetera = await asegurarBilletera(usuario, { transaction: opciones.transaction });
    billetera.saldo = parseFloat(billetera.saldo || 0) + parseFloat(monto);
    await billetera.save({ transaction: opciones.transaction });
    if (!opciones.skipTransaccion) {
      await Transaccion.create({ billetera: billetera.id, monto, tipo, ...(opciones.meta || {}) }, { transaction: opciones.transaction });
    }
    return billetera;
  }

  return await db.transaction(async (transaccion) => {
    const billetera = await asegurarBilletera(usuario, { transaction: transaccion });
    billetera.saldo = parseFloat(billetera.saldo || 0) + parseFloat(monto);
    await billetera.save({ transaction: transaccion });
    if (!opciones.skipTransaccion) {
      await Transaccion.create({ billetera: billetera.id, monto, tipo, ...(opciones.meta || {}) }, { transaction: transaccion });
    }
    return billetera;
  });
};

const debitar = async (usuario, monto, tipo = "Pago", opciones = {}) => {
  if (Number(monto) <= 0) throw new Error("El monto a debitar debe ser mayor que 0");

  if (opciones.transaction) {
    const billetera = await asegurarBilletera(usuario, { transaction: opciones.transaction });
    const saldoActual = parseFloat(billetera.saldo || 0);
    if (saldoActual < parseFloat(monto)) throw new Error("Saldo insuficiente");
    billetera.saldo = saldoActual - parseFloat(monto);
    await billetera.save({ transaction: opciones.transaction });
    if (!opciones.skipTransaccion) {
      await Transaccion.create({ billetera: billetera.id, monto, tipo, ...(opciones.meta || {}) }, { transaction: opciones.transaction });
    }
    return billetera;
  }

  return await db.transaction(async (transaccion) => {
    const billetera = await asegurarBilletera(usuario, { transaction: transaccion });
    const saldoActual = parseFloat(billetera.saldo || 0);
    if (saldoActual < parseFloat(monto)) throw new Error("Saldo insuficiente");
    billetera.saldo = saldoActual - parseFloat(monto);
    await billetera.save({ transaction: transaccion });
    if (!opciones.skipTransaccion) {
      await Transaccion.create({ billetera: billetera.id, monto, tipo, ...(opciones.meta || {}) }, { transaction: transaccion });
    }
    return billetera;
  });
};

module.exports = {
  asegurarBilletera,
  obtenerSaldo,
  acreditar,
  debitar,
};
