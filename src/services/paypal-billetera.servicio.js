const paypalServicio = require("./paypal.servicio");
const conversorServicio = require("./conversor.servicio");
const billeteraServicio = require("./billetera.servicio");

const TIPO_TRANSACCION = {
  RECARGA: "Recarga",
};

const ESTADO_ORDEN = {
  COMPLETADA: "COMPLETED",
};

const obtenerUrlAprobacion = (enlaces) => {
  if (!Array.isArray(enlaces)) return null;
  const enlaceAprobacion = enlaces.find((enlace) => enlace.rel === "approve");
  return enlaceAprobacion?.href || null;
};

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

const extraerDatosCaptura = (resultado) => {
  const unidadCompra = resultado.purchase_units?.[0] || {};
  const usuarioPersonalizado = unidadCompra.custom_id;
  const captura = unidadCompra.payments?.captures?.[0];
  const montoCapturado = captura?.amount?.value ? parseFloat(captura.amount.value) : null;

  console.log('Datos extraídos de PayPal:', {
    custom_id: usuarioPersonalizado,
    monto: montoCapturado,
    status: resultado.status
  });

  return {
    usuarioPersonalizado,
    montoCapturado,
  };
};

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

const capturarOrdenYAcreditarSinUsuario = async (ordenId) => {
  // Primero obtener la orden para extraer el custom_id antes de capturar
  const ordenCompleta = await paypalServicio.obtenerOrden(ordenId);
  
  const usuarioPersonalizadoPreCaptura = ordenCompleta.purchase_units?.[0]?.custom_id;
  
  console.log('Orden antes de capturar:', {
    id: ordenId,
    custom_id: usuarioPersonalizadoPreCaptura,
    status: ordenCompleta.status
  });
  
  if (!usuarioPersonalizadoPreCaptura) {
    throw new Error("No se encontró el ID de usuario en la orden de PayPal");
  }
  
  const usuarioId = parseInt(usuarioPersonalizadoPreCaptura, 10);
  
  if (isNaN(usuarioId)) {
    throw new Error("El ID de usuario en la orden no es válido");
  }
  
  // Ahora capturar la orden
  return capturarOrdenYAcreditar(ordenId, usuarioId);
};

module.exports = {
  crearOrdenRecarga,
  capturarOrdenYAcreditar,
  capturarOrdenYAcreditarSinUsuario,
};
