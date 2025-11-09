const { validationResult } = require("express-validator");
const billeteraService = require("../services/billeteraService");
const paypal = require("../services/paypalService");

const controlador = {};

controlador.obtenerSaldo = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    if (!usuarioId) return res.status(400).json({ error: "usuarioId requerido" });
    const saldo = await billeteraService.obtenerSaldo(usuarioId);
    res.json({ usuario: usuarioId, saldo });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

controlador.acreditar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json(errores.array());
  try {
    const { usuarioId, monto } = req.body;
    if (!usuarioId || !monto) return res.status(400).json({ error: "usuarioId y monto son requeridos" });
    const billetera = await billeteraService.acreditar(usuarioId, parseFloat(monto), "Recarga");
    res.json({ ok: true, billetera });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

controlador.paypalCrearOrden = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json(errores.array());
  try {
    const { usuarioId, monto, currency } = req.body;
    if (!usuarioId || !monto) return res.status(400).json({ error: "usuarioId y monto son requeridos" });
    const order = await paypal.createOrder({ value: parseFloat(monto), currency: currency || 'USD', usuarioId });
    const approve = (order.links || []).find(l => l.rel === 'approve');
    res.json({ id: order.id, status: order.status, approveUrl: approve && approve.href });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

controlador.paypalCapturarOrden = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json(errores.array());
  try {
    const { orderId, usuarioId: usuarioIdBody } = req.body;
    if (!orderId) return res.status(400).json({ error: "orderId es requerido" });
    const result = await paypal.captureOrder(orderId);
    if (result.status !== 'COMPLETED') return res.status(400).json({ error: 'La orden no fue completada' });
    const pu = (result.purchase_units && result.purchase_units[0]) || {};
    const customId = pu.custom_id;
    const capture = pu.payments && pu.payments.captures && pu.payments.captures[0];
    const amount = capture && capture.amount && parseFloat(capture.amount.value);
    const usuarioId = usuarioIdBody || (customId ? parseInt(customId, 10) : null);
    if (!usuarioId) return res.status(400).json({ error: 'No se pudo determinar el usuarioId' });
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Monto capturado inválido' });
    const billetera = await billeteraService.acreditar(usuarioId, amount, 'Recarga');
    res.json({ ok: true, billetera, captura: { id: capture && capture.id, status: capture && capture.status, amount: amount } });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

module.exports = controlador;
