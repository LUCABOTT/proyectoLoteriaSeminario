const { Router } = require("express");
const { body } = require("express-validator");
const controlador = require("../controladores/billeteraControlador");

const rutas = Router();

/**
 * @swagger
 * /api/billetera/saldo/{usuarioId}:
 *   get:
 *     summary: Obtener saldo de la billetera
 *     tags: [Billetera]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Saldo actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   type: integer
 *                 saldo:
 *                   type: number
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
rutas.get("/saldo/:usuarioId", controlador.obtenerSaldo);

/**
 * @swagger
 * /api/billetera/recargar:
 *   post:
 *     summary: Acreditar saldo manualmente
 *     tags: [Billetera]
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuarioId, monto]
 *             properties:
 *               usuarioId:
 *                 type: integer
 *               monto:
 *                 type: number
 *     responses:
 *       200:
 *         description: Billetera acreditada
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
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
/**
 * @swagger
 * /api/billetera/paypal/create-order:
 *   post:
 *     summary: Crear orden de PayPal para recarga
 *     tags: [PayPal]
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuarioId, monto]
 *             properties:
 *               usuarioId:
 *                 type: integer
 *               monto:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: USD
 *     responses:
 *       200:
 *         description: Orden creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 approveUrl:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
rutas.post(
  "/paypal/create-order",
  [
    body("usuarioId").notEmpty().withMessage("usuarioId es requerido"),
    body("monto").notEmpty().isFloat({ gt: 0 }).withMessage("monto debe ser mayor que 0"),
    body("currency").optional().isString(),
  ],
  controlador.paypalCrearOrden
);

/**
 * @swagger
 * /api/billetera/paypal/capture-order:
 *   post:
 *     summary: Capturar orden de PayPal y acreditar saldo
 *     tags: [PayPal]
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId:
 *                 type: string
 *               usuarioId:
 *                 type: integer
 *                 description: Se usa si no se envió custom_id en create-order
 *     responses:
 *       200:
 *         description: Orden capturada y saldo acreditado
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
rutas.post(
  "/paypal/capture-order",
  [
    body("orderId").notEmpty().withMessage("orderId es requerido"),
    body("usuarioId").optional(),
  ],
  controlador.paypalCapturarOrden
);

module.exports = rutas;
