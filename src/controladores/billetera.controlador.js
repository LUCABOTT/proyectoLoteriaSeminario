const { validationResult } = require("express-validator");
const billeteraServicio = require("../services/billetera.servicio");
const paypalBilleteraServicio = require("../services/paypal-billetera.servicio");

const billeteraControlador = {};

const MENSAJE_ERROR = {
  SERVIDOR: "Error interno del servidor",
  MONTO_INVALIDO: "El monto debe ser un número válido mayor que 0",
  USUARIO_NO_AUTENTICADO: "Usuario no autenticado",
};

const TIPO_TRANSACCION = {
  RECARGA: "Recarga",
};

/**
 * Obtiene el saldo actual de la billetera del usuario autenticado
 *
 * @async
 * @function obtenerSaldo
 * @param {Object} request - Objeto de solicitud HTTP de Express
 * @param {Object} request.user - Usuario autenticado del middleware
 * @param {Object} response - Objeto de respuesta HTTP de Express
 * @returns {Promise<void>} JSON con el saldo del usuario
 * @throws {Error} 401 - Usuario no autenticado
 * @throws {Error} 500 - Error interno del servidor
 */
billeteraControlador.obtenerSaldo = async (request, response) => {
  try {
    if (!request.user?.id) {
      return response.status(401).json({
        error: MENSAJE_ERROR.USUARIO_NO_AUTENTICADO,
      });
    }

    const saldo = await billeteraServicio.obtenerSaldo(request.user.id);

    response.json({
      usuario: request.user.id,
      saldo,
    });
  } catch (error) {
    response.status(500).json({
      error: MENSAJE_ERROR.SERVIDOR,
    });
  }
};

/**
 * Valida que el monto sea un número positivo válido
 *
 * @function validarMonto
 * @param {number|string} monto - Monto a validar
 * @returns {boolean} true si el monto es válido, false en caso contrario
 */
const validarMonto = (monto) => {
  if (!monto) return false;

  const montoNumerico = parseFloat(monto);
  return !isNaN(montoNumerico) && montoNumerico > 0;
};

/**
 * Recarga la billetera del usuario autenticado con un monto específico en HNL
 *
 * @async
 * @function recargar
 * @param {Object} request - Objeto de solicitud HTTP de Express
 * @param {Object} request.user - Usuario autenticado del middleware
 * @param {Object} request.body - Cuerpo de la solicitud
 * @param {number} request.body.monto - Monto en HNL a recargar
 * @param {Object} response - Objeto de respuesta HTTP de Express
 * @returns {Promise<void>} JSON con mensaje de éxito y datos de la billetera
 * @throws {Error} 400 - Error de validación
 * @throws {Error} 401 - Usuario no autenticado
 * @throws {Error} 500 - Error interno del servidor
 */
billeteraControlador.recargar = async (request, response) => {
  const errores = validationResult(request);
  if (!errores.isEmpty()) {
    return response.status(400).json(errores.array());
  }

  try {
    if (!request.user?.id) {
      return response.status(401).json({
        error: MENSAJE_ERROR.USUARIO_NO_AUTENTICADO,
      });
    }

    const { monto } = request.body;

    if (!validarMonto(monto)) {
      return response.status(400).json({
        error: MENSAJE_ERROR.MONTO_INVALIDO,
      });
    }

    const montoHNL = parseFloat(monto);

    const billetera = await billeteraServicio.acreditar(request.user.id, montoHNL, TIPO_TRANSACCION.RECARGA);

    response.json({
      mensaje: "Saldo acreditado correctamente",
      billetera,
    });
  } catch (error) {
    response.status(500).json({
      error: MENSAJE_ERROR.SERVIDOR,
    });
  }
};

/**
 * Crea una orden de pago en PayPal para recargar la billetera del usuario autenticado
 *
 * @async
 * @function paypalCrearOrden
 * @param {Object} request - Objeto de solicitud HTTP de Express
 * @param {Object} request.user - Usuario autenticado del middleware
 * @param {Object} request.body - Cuerpo de la solicitud
 * @param {number} request.body.monto - Monto en HNL a recargar
 * @param {Object} response - Objeto de respuesta HTTP de Express
 * @returns {Promise<void>} JSON con ID de orden, estado y URL de aprobación
 * @throws {Error} 400 - Error de validación o en la creación de la orden
 * @throws {Error} 401 - Usuario no autenticado
 */
billeteraControlador.paypalCrearOrden = async (request, response) => {
  const errores = validationResult(request);
  if (!errores.isEmpty()) {
    return response.status(400).json(errores.array());
  }

  try {
    if (!request.user?.id) {
      return response.status(401).json({
        error: MENSAJE_ERROR.USUARIO_NO_AUTENTICADO,
      });
    }

    const { monto } = request.body;

    if (!validarMonto(monto)) {
      return response.status(400).json({
        error: MENSAJE_ERROR.MONTO_INVALIDO,
      });
    }

    const montoHNL = parseFloat(monto);
    const resultado = await paypalBilleteraServicio.crearOrdenRecarga(request.user.id, montoHNL);

    response.json(resultado);
  } catch (error) {
    response.status(400).json({
      error: error.message,
    });
  }
};

/**
 * Captura y procesa una orden de pago de PayPal del usuario autenticado
 *
 * @async
 * @function paypalCapturarOrden
 * @param {Object} request - Objeto de solicitud HTTP de Express
 * @param {Object} request.user - Usuario autenticado del middleware
 * @param {Object} request.body - Cuerpo de la solicitud
 * @param {string} request.body.orden - ID de la orden de PayPal
 * @param {Object} response - Objeto de respuesta HTTP de Express
 * @returns {Promise<void>} JSON con mensaje de éxito y datos de la billetera
 * @throws {Error} 400 - Error de validación o orden no completada
 * @throws {Error} 401 - Usuario no autenticado
 * @throws {Error} 500 - Error interno del servidor
 */
billeteraControlador.paypalCapturarOrden = async (request, response) => {
  const errores = validationResult(request);
  if (!errores.isEmpty()) {
    return response.status(400).json(errores.array());
  }

  try {
    if (!request.user?.id) {
      return response.status(401).json({
        error: MENSAJE_ERROR.USUARIO_NO_AUTENTICADO,
      });
    }

    const { orden } = request.body;

    const billetera = await paypalBilleteraServicio.capturarOrdenYAcreditar(orden, request.user.id);

    response.json({
      mensaje: "Recarga completada",
      billetera,
    });
  } catch (error) {
    const statusCode = error.message.includes("completada") || error.message.includes("determinar") || error.message.includes("inválido") ? 400 : 500;
    response.status(statusCode).json({
      error: error.message || MENSAJE_ERROR.SERVIDOR,
    });
  }
};

module.exports = billeteraControlador;
