# proyectoLoteriaSeminario

## Recargas con PayPal (simple)

Variables de entorno requeridas:
- PAYPAL_CLIENT_ID
- PAYPAL_CLIENT_SECRET
- PAYPAL_ENV=sandbox | live
- PAYPAL_RETURN_URL (opcional)
- PAYPAL_CANCEL_URL (opcional)

Endpoints protegidos bajo /api/billetera:
- POST /api/billetera/paypal/create-order { usuarioId, monto, currency? } -> devuelve { id, approveUrl }
- POST /api/billetera/paypal/capture-order { orderId, usuarioId? } -> acredita el monto en la billetera

Flujo básico:
1) Crear orden -> redirigir al approveUrl de PayPal.
2) Tras aprobar, capturar con orderId -> la API acredita el monto a la billetera del usuario.
