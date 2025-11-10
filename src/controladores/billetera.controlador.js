const { validationResult } = require("express-validator");
const billeteraServicio = require("../services/billetera.servicio");
const paypal = require("../services/paypal.servicio");

const controlador = {};

controlador.obtenerSaldo = async (request, response) => {
  try {
    const { id } = request.params;
    const saldo = await billeteraServicio.obtenerSaldo(id);

    response.json({ usuario: id, saldo });
  } catch (error) {
    response.status(500).json({ error: "Error interno del servidor" });
  }
};

controlador.recargar = async (request, response) => {
  const errores = validationResult(request);
  if (!errores.isEmpty()) return response.status(400).json(errores.array());

  try {
    const { id, monto } = request.body;
    const billetera = await billeteraServicio.acreditar(
      id,
      parseFloat(monto),
      "Recarga",
    );

    response.json({ mensaje: "Saldo acreditado correctamente", billetera });
  } catch (error) {
    response.status(500).json({ error: "Error interno del servidor" });
  }
};

controlador.paypalCrearOrden = async (request, response) => {
  const errores = validationResult(request);
  if (!errores.isEmpty()) return response.status(400).json(errores.array());

  try {
    const { id, monto } = request.body;

    if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
      return response
        .status(400)
        .json({ error: "El monto debe ser un número válido mayor que 0" });
    }

    const orden = await paypal.crearOrden({
      monto: parseFloat(monto),
      usuario: id,
    });
    const aprobacion = (orden.links || []).find((l) => l.rel === "approve");
    response.json({
      id: orden.id,
      status: orden.status,
      approveUrl: aprobacion && aprobacion.href,
    });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};

controlador.paypalCapturarOrden = async (request, response) => {
  const errores = validationResult(request);
  if (!errores.isEmpty()) return response.status(400).json(errores.array());

  try {
    const { orden, usuario } = request.body;

    const resultado = await paypal.capturarOrden(orden);
    if (resultado.status !== "COMPLETED")
      return response.status(400).json({ error: "La orden no fue completada" });
    const unidadDeCompra =
      (resultado.purchase_units && resultado.purchase_units[0]) || {};
    const idPersonalizado = unidadDeCompra.custom_id;
    const captura =
      unidadDeCompra.payments &&
      unidadDeCompra.payments.captures &&
      unidadDeCompra.payments.captures[0];
    const monto = captura && captura.amount && parseFloat(captura.amount.value);
    const usuarioId =
      usuario || (idPersonalizado ? parseInt(idPersonalizado, 10) : null);
    if (!usuarioId)
      return response
        .status(400)
        .json({ error: "No se pudo determinar el usuarioId" });
    if (!monto || monto <= 0)
      return response.status(400).json({ error: "Monto capturado inválido" });
    const billetera = await billeteraServicio.acreditar(
      usuarioId,
      monto,
      "Recarga",
    );
    response.json({ mensaje: "Recarga completada", billetera });
  } catch (error) {
    response.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = controlador;
