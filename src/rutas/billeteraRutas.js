const { Router } = require("express");
const { body, param } = require("express-validator");
const controlador = require("../controladores/billetera.controlador");

const rutas = Router();

rutas.get("/saldo/:id", controlador.obtenerSaldo);

rutas.post(
  "/recargar",
  [
    body("id").notEmpty().withMessage("id es requerido"),
    body("monto")
      .notEmpty()
      .isFloat({ gt: 0 })
      .withMessage("monto debe ser mayor que 0"),
  ],
  controlador.recargar,
);
rutas.post(
  "/paypal/crear",
  [
    body("id").notEmpty().withMessage("id es requerido"),
    body("monto")
      .notEmpty()
      .isFloat({ gt: 0 })
      .withMessage("monto debe ser mayor que 0"),
  ],
  controlador.paypalCrearOrden,
);
rutas.post(
  "/paypal/capturar",
  [
    body("orden").notEmpty().withMessage("orden es requerido"),
    body("usuario").notEmpty().withMessage("usuario es requerido"),
  ],
  controlador.paypalCapturarOrden,
);

module.exports = rutas;
