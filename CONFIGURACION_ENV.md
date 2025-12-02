# Guía de Configuración del Backend

## 📋 Variables de Entorno

El archivo `.env` contiene todas las configuraciones necesarias para el backend. Este archivo **NO debe subirse a Git** por seguridad.

---

## 🚀 Configuración Inicial Rápida

### **1. Copiar el archivo de ejemplo**

```bash
cd backend
cp .env.example .env
```

### **2. Configuración mínima para desarrollo**

Edita `.env` y configura al menos estas variables:

```env
# Base de datos
USUARIO=root
CONTRASENA=tu_contraseña_mysql
DB=proyectoseminario

# JWT (¡IMPORTANTE! Cámbialo por algo único)
JWT_SECRET=mi_clave_super_secreta_2024_xyz
JWT_EXPIRATION=24h
```

### **3. Iniciar el servidor**

```bash
npm install
npm start
```

Si todo está bien, deberías ver:
```
✅ Sincronización de modelos finalizada
Servidor Funcionando en puerto 3004
```

---

## 🔧 Configuración Detallada

### **Base de Datos (MySQL/MariaDB)**

```env
USUARIO=root              # Usuario de MySQL
CONTRASENA=12345          # Contraseña de MySQL
DB=proyectoseminario      # Nombre de la base de datos
```

**Crear la base de datos:**
```sql
CREATE DATABASE proyectoseminario CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Las tablas se crean automáticamente con Sequelize al iniciar el servidor.

---

### **JWT (JSON Web Tokens)**

```env
JWT_SECRET=tu_clave_super_secreta
JWT_EXPIRATION=24h
```

**Recomendaciones:**
- Usa una clave de al menos 32 caracteres
- Combina letras, números y símbolos
- NO uses la clave de ejemplo en producción
- Puedes generar una clave segura con:

**En Linux/Mac:**
```bash
openssl rand -base64 32
```

**En Node.js:**
```javascript
require('crypto').randomBytes(32).toString('hex')
```

**Expiración:**
- `24h` = 24 horas
- `7d` = 7 días
- `30m` = 30 minutos

---

### **Correo Electrónico (SMTP)**

Para enviar correos de activación, reactivación, etc.

```env
USUARIO_CORREO=tu_correo@gmail.com
CONTRASENA_CORREO=abcd efgh ijkl mnop
```

#### **Configuración para Gmail:**

1. **Habilitar autenticación de 2 factores**
   - Ve a: https://myaccount.google.com/security
   - Activa "Verificación en dos pasos"

2. **Crear contraseña de aplicación**
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro (personalizado)"
   - Copia la contraseña de 16 caracteres
   - Pégala en `CONTRASENA_CORREO` (sin espacios)

3. **Usar el correo y la contraseña en .env**

#### **Otros proveedores:**

Para Outlook, Yahoo, etc., consulta la documentación de cada proveedor para obtener credenciales SMTP.

---

### **PayPal (Pagos)**

```env
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_CLIENT_SECRET=tu_secret
PAYPAL_ENV=sandbox
PAYPAL_RETURN_URL=http://localhost:3004/api/billetera/paypal/capturar
PAYPAL_CANCEL_URL=http://localhost:3004/api/billetera/paypal/cancelar
```

#### **Obtener credenciales de PayPal:**

**Para desarrollo (Sandbox):**

1. Ve a: https://developer.paypal.com/
2. Inicia sesión con tu cuenta PayPal
3. Ve a "Dashboard" → "My Apps & Credentials"
4. En la pestaña "Sandbox", crea una nueva app
5. Copia el "Client ID" y "Secret"
6. Pégalos en `.env`

**Para producción (Live):**

1. Cambia `PAYPAL_ENV=live`
2. Usa credenciales de la pestaña "Live" en PayPal
3. **IMPORTANTE:** Verifica que tu cuenta PayPal esté aprobada para pagos

#### **URLs de retorno:**

Ajusta estas URLs según tu dominio:

- Desarrollo: `http://localhost:3004/api/billetera/paypal/...`
- Producción: `https://tudominio.com/api/billetera/paypal/...`

---

### **Google OAuth (Opcional)**

Para permitir login con Google.

```env
GOOGLE_CLIENT_ID=123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcd1234
```

#### **Configurar Google OAuth:**

1. **Ir a Google Cloud Console**
   - https://console.cloud.google.com/

2. **Crear un proyecto**
   - Nombre: "Lotería Digital"

3. **Habilitar Google+ API**
   - Ve a "APIs y servicios" → "Biblioteca"
   - Busca "Google+ API" y habilítala

4. **Crear credenciales OAuth 2.0**
   - Ve a "Credenciales" → "Crear credenciales" → "ID de cliente de OAuth"
   - Tipo: "Aplicación web"
   - URIs de redirección autorizadas:
     ```
     http://localhost:3004/api/auth/google/callback
     ```

5. **Copiar credenciales**
   - Client ID: Pégalo en `GOOGLE_CLIENT_ID`
   - Client Secret: Pégalo en `GOOGLE_CLIENT_SECRET`

**Nota:** Si dejas estos campos vacíos, el login con Google simplemente no estará disponible (no rompe la app).

---

### **Frontend URL**

```env
FRONTEND_URL=http://localhost:5173
```

Esta URL se usa para:
- Redirects después de pagos PayPal
- Correos con links de activación
- CORS (si se configura)

**En producción:**
```env
FRONTEND_URL=https://tudominio.com
```

---

### **Conversor de Moneda**

```env
HNL_USD_RATE=24.50
```

Tasa de conversión de Lempiras (HNL) a Dólares (USD).

**Actualizar según tasa actual:**
- Revisa: https://www.bch.hn/
- Ejemplo: Si 1 USD = 24.50 HNL, usa `24.50`

---

### **Scheduler (Jobs Automáticos)**

```env
SCHEDULER_ENABLED=true
SCHEDULER_INTERVAL_MS=60000
```

**Qué hace el scheduler:**
- Cierra sorteos automáticamente cuando llega la hora
- Ejecuta sorteos programados
- Actualiza estados

**Configuración:**
- `SCHEDULER_ENABLED=true` → Activa el scheduler
- `SCHEDULER_ENABLED=false` → Desactiva el scheduler
- `SCHEDULER_INTERVAL_MS=60000` → Revisa cada 1 minuto (60000 ms)

**Recomendaciones:**
- Desarrollo: `60000` (1 minuto)
- Producción: `30000` (30 segundos) para más precisión

---

## ✅ Validación de Configuración

### **Verificar que todo funciona:**

1. **Iniciar el servidor**
   ```bash
   npm start
   ```

2. **Verificar logs**
   ```
   ✅ Conexión exitosa a la base de datos
   ✅ Sincronización de modelos finalizada
   Servidor Funcionando en puerto 3004
   ```

3. **Probar endpoints**
   ```bash
   # Health check
   curl http://localhost:3004/api/auth/login
   
   # Deberías recibir un error 400 (porque no enviaste datos)
   # Si recibes error de conexión, revisa la configuración
   ```

---

## 🔒 Seguridad

### **En desarrollo:**
- ✅ Usa contraseñas simples para MySQL
- ✅ Usa PayPal Sandbox
- ✅ El JWT_SECRET puede ser simple

### **En producción:**
- ⚠️ **NUNCA** subas `.env` a Git
- ⚠️ Usa contraseñas fuertes para todo
- ⚠️ Cambia `JWT_SECRET` a algo único
- ⚠️ Usa HTTPS (no HTTP)
- ⚠️ Configura CORS correctamente
- ⚠️ Usa PayPal Live (no Sandbox)
- ⚠️ Habilita firewall en el servidor
- ⚠️ Usa variables de entorno del sistema (no archivo .env)

---

## 🐛 Solución de Problemas

### **Error: "Cannot connect to database"**
- Verifica que MySQL esté corriendo
- Revisa `USUARIO`, `CONTRASENA`, `DB` en `.env`
- Crea la base de datos manualmente si no existe

### **Error: "JWT must be provided"**
- Verifica que `JWT_SECRET` esté configurado
- NO debe estar vacío

### **Error: "PayPal authentication failed"**
- Verifica `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`
- Verifica que `PAYPAL_ENV=sandbox` (para desarrollo)

### **Error: "Cannot send email"**
- Verifica credenciales de Gmail
- Asegúrate de usar contraseña de aplicación (no tu contraseña normal)
- Verifica que la autenticación de 2 factores esté activada

### **El scheduler no funciona**
- Verifica `SCHEDULER_ENABLED=true`
- Revisa los logs del servidor para ver si hay errores

---

## 📝 Variables de Entorno por Categoría

### **Obligatorias (mínimo para funcionar):**
```env
USUARIO=root
CONTRASENA=12345
DB=proyectoseminario
JWT_SECRET=clave_segura
```

### **Recomendadas:**
```env
USUARIO_CORREO=tu@correo.com
CONTRASENA_CORREO=contraseña_app
FRONTEND_URL=http://localhost:5173
```

### **Opcionales:**
```env
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
HNL_USD_RATE=24.50
SCHEDULER_ENABLED=true
```

---

## 🎯 Configuración Recomendada para Empezar

```env
# Mínimo funcional
PORT=3004
USUARIO=root
CONTRASENA=12345
DB=proyectoseminario
JWT_SECRET=desarrollo_2024_xyz_no_usar_en_produccion
JWT_EXPIRATION=24h
FRONTEND_URL=http://localhost:5173
SCHEDULER_ENABLED=true
SCHEDULER_INTERVAL_MS=60000
HNL_USD_RATE=24.50

# Dejar vacíos si no los necesitas aún
USUARIO_CORREO=
CONTRASENA_CORREO=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Con esta configuración mínima podrás:
- ✅ Registrar usuarios (sin email de confirmación)
- ✅ Login/logout
- ✅ Recargar billetera (manual)
- ✅ Comprar tickets
- ✅ Ver sorteos

Luego puedes agregar PayPal y correo cuando lo necesites.

---

**Última actualización:** 2 de diciembre de 2025
