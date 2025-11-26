const { Router } = require("express");
const { body } = require("express-validator");
const authenticateToken = require("../middlewares/auth");
const controlador = require("../controladores/billetera.controlador");

const rutas = Router();

rutas.get("/saldo", authenticateToken, controlador.obtenerSaldo);

rutas.post(
  "/recargar",
  authenticateToken,
  [
    body("monto")
      .notEmpty()
      .isFloat({ gt: 0 })
      .withMessage("monto debe ser mayor que 0"),
    body("moneda")
      .optional()
      .isIn(["HNL", "USD"])
      .withMessage("moneda debe ser 'HNL' o 'USD'"),
  ],
  controlador.recargar,
);

rutas.post(
  "/paypal/crear",
  authenticateToken,
  [
    body("monto")
      .notEmpty()
      .isFloat({ gt: 0 })
      .withMessage("monto debe ser mayor que 0"),
  ],
  controlador.paypalCrearOrden,
);

rutas.post(
  "/paypal/capturar",
  authenticateToken,
  [body("orden").notEmpty().withMessage("orden es requerido")],
  controlador.paypalCapturarOrden,
);

module.exports = rutas;
