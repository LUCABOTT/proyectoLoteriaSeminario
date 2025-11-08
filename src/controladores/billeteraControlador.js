const { validationResult } = require("express-validator");
const billeteraService = require("../services/billeteraService");

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

module.exports = controlador;
