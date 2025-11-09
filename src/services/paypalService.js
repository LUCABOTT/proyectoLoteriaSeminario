const checkout = require('@paypal/checkout-server-sdk');

function paypalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const env = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase();
  if (!clientId || !clientSecret) throw new Error('Faltan PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET');
  const environment = env === 'live'
    ? new checkout.core.LiveEnvironment(clientId, clientSecret)
    : new checkout.core.SandboxEnvironment(clientId, clientSecret);
  return new checkout.core.PayPalHttpClient(environment);
}

async function createOrder({ value, currency = 'USD', usuarioId, description }) {
  const client = paypalClient();
  const amountStr = Number(value).toFixed(2);
  const request = new checkout.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: { currency_code: currency, value: amountStr },
        custom_id: String(usuarioId || ''),
        description: description || 'Recarga de billetera',
      },
    ],
  };
  const returnUrl = process.env.PAYPAL_RETURN_URL;
  const cancelUrl = process.env.PAYPAL_CANCEL_URL;
  if (returnUrl || cancelUrl) {
    body.application_context = {
      return_url: returnUrl,
      cancel_url: cancelUrl,
      user_action: 'PAY_NOW',
    };
  }
  request.requestBody(body);
  const response = await client.execute(request);
  return response.result;
}

async function captureOrder(orderId) {
  const client = paypalClient();
  const request = new checkout.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});
  const response = await client.execute(request);
  return response.result;
}

module.exports = { createOrder, captureOrder };
