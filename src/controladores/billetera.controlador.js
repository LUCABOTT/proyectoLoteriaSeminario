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

const validarMonto = (monto) => {
  if (!monto) return false;

  const montoNumerico = parseFloat(monto);
  return !isNaN(montoNumerico) && montoNumerico > 0;
};

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
    const statusCode =
      error.message.includes("completada") || error.message.includes("determinar") || error.message.includes("inválido")
        ? 400
        : 500;
    response.status(statusCode).json({
      error: error.message || MENSAJE_ERROR.SERVIDOR,
    });
  }
};

billeteraControlador.obtenerHistorial = async (request, response) => {
  try {
    if (!request.user?.id) {
      return response.status(401).json({
        error: MENSAJE_ERROR.USUARIO_NO_AUTENTICADO,
      });
    }

    const limite = parseInt(request.query.limite) || 50;
    const pagina = parseInt(request.query.pagina) || 1;
    const offset = (pagina - 1) * limite;

    const billetera = await billeteraServicio.asegurarBilletera(request.user.id);

    const { count, rows } = await require("../modelos/transaccion.modelo").findAndCountAll({
      where: { billetera: billetera.id },
      order: [["creada", "DESC"]],
      limit: limite,
      offset: offset,
    });

    response.json({
      usuario: request.user.id,
      transacciones: rows,
      total: count,
      pagina: pagina,
      totalPaginas: Math.ceil(count / limite),
    });
  } catch (error) {
    response.status(500).json({
      error: MENSAJE_ERROR.SERVIDOR,
    });
  }
};

billeteraControlador.paypalCapturarOrdenRedirect = async (request, response) => {
  try {
    const { token } = request.query;

    if (!token) {
      return response.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/billetera?error=token_invalido`);
    }

    const billetera = await paypalBilleteraServicio.capturarOrdenYAcreditarSinUsuario(token);

    response.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/billetera?exito=true&monto=${billetera.saldo}`);
  } catch (error) {
    response.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/billetera?error=${encodeURIComponent(error.message)}`);
  }
};

billeteraControlador.paypalCancelarOrden = async (request, response) => {
  response.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/billetera?cancelado=true`);
};

module.exports = billeteraControlador;
