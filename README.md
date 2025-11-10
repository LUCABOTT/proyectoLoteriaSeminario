# Proyecto Lotería Seminario

## Descripción

Este es un sistema de lotería desarrollado en Node.js y Express que permite a los usuarios participar en sorteos, gestionar su billetera virtual con integración de PayPal.

## Variables de entorno

```
# Puerto de la aplicación
PORT=3004

# Base de datos
USUARIO=
CONTRASENA=
DB=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=sandbox
PAYPAL_RETURN_URL=http://localhost:3004/api/billetera/paypal/capturar

# JSON Web Token
JWT_SECRET=
JWT_EXPIRATION=

# Correo electrónico
USUARIO_CORREO=
CONTRASENA_CORREO=
```
