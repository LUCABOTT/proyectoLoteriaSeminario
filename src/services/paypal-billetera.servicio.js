const paypalServicio = require("./paypal.servicio");
const conversorServicio = require("./conversor.servicio");
const billeteraServicio = require("./billetera.servicio");

const TIPO_TRANSACCION = {
  RECARGA: "Recarga",
};

const ESTADO_ORDEN = {
  COMPLETADA: "COMPLETED",
};

/**
 * Busca el enlace de aprobación en los links de la orden de PayPal
 */
const obtenerUrlAprobacion = (enlaces) => {
  if (!Array.isArray(enlaces)) return null;
  const enlaceAprobacion = enlaces.find((enlace) => enlace.rel === "approve");
  return enlaceAprobacion?.href || null;
};

/**
 * Crea una orden de pago en PayPal para recargar la billetera
 */
const crearOrdenRecarga = async (usuarioId, montoHNL) => {
  const montoUSD = conversorServicio.hnlToUsd(montoHNL);

  const orden = await paypalServicio.crearOrden({
    monto: montoUSD,
    usuario: usuarioId,
    descripcion: `Recarga de billetera (${montoHNL} HNL ≈ ${montoUSD} USD)`,
  });

  const urlAprobacion = obtenerUrlAprobacion(orden.links);

  return {
    idOrden: orden.id,
    estado: orden.status,
    urlAprobacion,
  };
};

/**
 * Extrae la información de captura de una orden de PayPal
 */
const extraerDatosCaptura = (resultado) => {
  const unidadCompra = resultado.purchase_units?.[0] || {};
  const usuarioPersonalizado = unidadCompra.custom_id;
  const captura = unidadCompra.payments?.captures?.[0];
  const montoCapturado = captura?.amount?.value ? parseFloat(captura.amount.value) : null;

  return {
    usuarioPersonalizado,
    montoCapturado,
  };
};

/**
 * Captura y procesa una orden de pago de PayPal, acreditando el saldo a la billetera
 */
const capturarOrdenYAcreditar = async (ordenId, usuarioId) => {
  const resultado = await paypalServicio.capturarOrden(ordenId);

  if (resultado.status !== ESTADO_ORDEN.COMPLETADA) {
    throw new Error("La orden no fue completada");
  }

  const { usuarioPersonalizado, montoCapturado } = extraerDatosCaptura(resultado);

  const usuarioFinal = usuarioId || (usuarioPersonalizado ? parseInt(usuarioPersonalizado, 10) : null);

  if (!usuarioFinal) {
    throw new Error("No se pudo determinar el ID del usuario");
  }

  if (!montoCapturado || montoCapturado <= 0) {
    throw new Error("Monto capturado inválido");
  }

  const montoEnHNL = conversorServicio.usdToHnl(montoCapturado);
  const billetera = await billeteraServicio.acreditar(usuarioFinal, montoEnHNL, TIPO_TRANSACCION.RECARGA);

  return billetera;
};

module.exports = {
  crearOrdenRecarga,
  capturarOrdenYAcreditar,
};
