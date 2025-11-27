// Servicio simple para convertir entre Lempiras (HNL) y Dólares (USD)
// Usa la variable de entorno `HNL_USD_RATE` que representa cuántas Lempiras hay por 1 USD.
const DEFAULT_RATE = 24.5;

function leerTasa() {
  const env = process.env.HNL_USD_RATE;
  const tasa = env ? parseFloat(env) : NaN;
  if (!isNaN(tasa) && tasa > 0) return tasa;
  return DEFAULT_RATE;
}

function hnlToUsd(montoHnl) {
  const monto = Number(montoHnl);
  if (isNaN(monto) || monto <= 0) throw new Error("Monto inválido para conversión HNL→USD");
  const tasa = leerTasa();
  const usd = monto / tasa;
  return Number(usd.toFixed(2));
}

function usdToHnl(montoUsd) {
  const monto = Number(montoUsd);
  if (isNaN(monto) || monto <= 0) throw new Error("Monto inválido para conversión USD→HNL");
  const tasa = leerTasa();
  const hnl = monto * tasa;
  return Number(hnl.toFixed(2));
}

module.exports = { hnlToUsd, usdToHnl, leerTasa };
