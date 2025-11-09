const { Router } = require("express");
const { body } = require("express-validator");
const controlador = require("../controladores/billeteraControlador");

const rutas = Router();

rutas.get("/saldo/:usuarioId", controlador.obtenerSaldo);

rutas.post(
  "/recargar",
  [
    body("usuarioId").notEmpty().withMessage("usuarioId es requerido"),
    body("monto")
      .notEmpty()
      .withMessage("monto es requerido")
      .isFloat({ gt: 0 })
      .withMessage("monto debe ser mayor que 0"),
  ],
  controlador.acreditar
);

// PayPal
rutas.post(
  "/paypal/create-order",
  [
    body("usuarioId").notEmpty().withMessage("usuarioId es requerido"),
    body("monto").notEmpty().isFloat({ gt: 0 }).withMessage("monto debe ser mayor que 0"),
    body("currency").optional().isString(),
  ],
  controlador.paypalCrearOrden
);

rutas.post(
  "/paypal/capture-order",
  [
    body("orderId").notEmpty().withMessage("orderId es requerido"),
    body("usuarioId").optional(),
  ],
  controlador.paypalCapturarOrden
);

module.exports = rutas;
