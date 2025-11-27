const checkout = require("@paypal/checkout-server-sdk");

function clientePaypal() {
  const idCliente = process.env.PAYPAL_CLIENT_ID;
  const secretoCliente = process.env.PAYPAL_CLIENT_SECRET;
  const entorno = (process.env.PAYPAL_ENV || "sandbox").toLowerCase();
  if (!idCliente || !secretoCliente) throw new Error("Faltan PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET");
  const ambiente = entorno === "live" ? new checkout.core.LiveEnvironment(idCliente, secretoCliente) : new checkout.core.SandboxEnvironment(idCliente, secretoCliente);
  return new checkout.core.PayPalHttpClient(ambiente);
}

async function crearOrden({ monto, usuario, descripcion }) {
  const cliente = clientePaypal();
  
  // Validar que el monto sea un número válido
  if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
    throw new Error("El monto debe ser un número válido mayor que 0");
  }
  
  // Validar que el usuario esté definido
  if (!usuario) {
    throw new Error("El ID de usuario es requerido para crear la orden");
  }
  
  const montoString = Number(monto).toFixed(2);
  const solicitud = new checkout.orders.OrdersCreateRequest();
  solicitud.prefer("return=representation");
  const cuerpo = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: { currency_code: "USD", value: montoString },
        custom_id: String(usuario),
        description: descripcion || "Recarga de billetera",
      },
    ],
  };
  const urlRetorno = process.env.PAYPAL_RETURN_URL;
  const urlCancelacion = process.env.PAYPAL_CANCEL_URL;
  if (urlRetorno || urlCancelacion) {
    cuerpo.application_context = {
      return_url: urlRetorno,
      cancel_url: urlCancelacion,
      user_action: "PAY_NOW",
    };
  }
  solicitud.requestBody(cuerpo);
  const respuesta = await cliente.execute(solicitud);
  return respuesta.result;
}

async function capturarOrden(orden) {
  const cliente = clientePaypal();
  const solicitud = new checkout.orders.OrdersCaptureRequest(orden);
  solicitud.requestBody({});
  const respuesta = await cliente.execute(solicitud);
  return respuesta.result;
}

async function obtenerOrden(orden) {
  const cliente = clientePaypal();
  const solicitud = new checkout.orders.OrdersGetRequest(orden);
  const respuesta = await cliente.execute(solicitud);
  return respuesta.result;
}

module.exports = { crearOrden, capturarOrden, obtenerOrden };
