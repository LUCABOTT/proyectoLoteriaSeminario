require("dotenv").config();
const passport = require("passport");
require("./configuracion/passport"); // importante
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const db = require("./configuracion/db");

let swaggerUI, swaggerDoc;
try {
  swaggerUI = require("swagger-ui-express");
  swaggerDoc = require("./configuracion/swagger.js");
} catch {
  console.warn("Swagger UI no está disponible");
}

// Modelos del repo (usuarios/roles/funciones/...)

const ModeloUsuario = require("./modelos/modelosUsuarios/usuarios");
const ModeloImagenUsuario = require("./modelos/modelosUsuarios/imagenes");
const ModeloTelefonosUsuarios = require("./modelos/modelosUsuarios/telefonoUsuario");
const ModeloRoles = require("./modelos/modelosUsuarios/roles");
const ModeloRolesUsuarios = require("./modelos/modelosUsuarios/roles_usuarios");
const ModeloFunciones = require("./modelos/modelosUsuarios/funciones");
const ModeloFuncionesRoles = require("./modelos/modelosUsuarios/funciones_roles");

// Modelos de Lotería

const Juego = require("./modelos/juegoModelo");
const Sorteo = require("./modelos/sorteoModelo");
const Ticket = require("./modelos/ticketsModelo");
const DetalleTicket = require("./modelos/detalleTicketModelo");

// Modelos de Billetera

const Billetera = require("./modelos/billetera.modelo");
const Transaccion = require("./modelos/transaccion.modelo");

// Middlewares y rutas existentes del repo

const authenticateToken = require("./middlewares/auth");
const authRoutes = require("./rutas/auth");
const checkRoleAccess = require("../src/middlewares/rolesAcces");

// Rutas de usuarios (repo)

const rutasUsuarios = require("./rutas/rutasUsuarios/rutaUsuarios");
const rutasImagenUsuario = require("./rutas/rutasUsuarios/rutasImagenUsuario");
const rutasTelefonosUsuarios = require("./rutas/rutasUsuarios/rutasTelefonosUsuarios");
const rutasRoles = require("./rutas/rutasUsuarios/rutasRoles");
const rutasRolesUsuarios = require("./rutas/rutasUsuarios/rutasRolesUsuarios");
const rutasFunciones = require("./rutas/rutasUsuarios/rutasFunciones");
const rutasFuncionesRoles = require("./rutas/rutasUsuarios/rutasFuncionesRoles");

// Rutas de Lotería

const juegoRutas = require("./rutas/juegoRutas");
const sorteoRutas = require("./rutas/sorteoRutas");
const ticketsRutas = require("./rutas/ticketsRutas");
const detalleTicketRutas = require("./rutas/detalleTicketRutas");
const rutasBilletera = require("./rutas/billeteraRutas");

// Asociaciones (declarar ANTES del sync)

function setupAssociations() {
  ModeloUsuario.hasMany(ModeloTelefonosUsuarios, {
    foreignKey: "idUsuario",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  ModeloTelefonosUsuarios.belongsTo(ModeloUsuario, { foreignKey: "idUsuario" });

  ModeloUsuario.belongsToMany(ModeloRoles, {
    through: ModeloRolesUsuarios,
    foreignKey: "usercod",
    otherKey: "rolescod",
  });

  ModeloRoles.belongsToMany(ModeloUsuario, {
    through: ModeloRolesUsuarios,
    foreignKey: "rolescod",
    otherKey: "usercod",
  });

  ModeloRoles.belongsToMany(ModeloFunciones, {
    through: ModeloFuncionesRoles,
    foreignKey: "rolescod",
    otherKey: "fncod",
  });
  ModeloFunciones.belongsToMany(ModeloRoles, {
    through: ModeloFuncionesRoles,
    foreignKey: "fncod",
    otherKey: "rolescod",
  });

  ModeloUsuario.hasMany(ModeloImagenUsuario, {
    foreignKey: "usuarioId",
    as: "imagenes",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  ModeloImagenUsuario.belongsTo(ModeloUsuario, {
    foreignKey: "usuarioId",
    as: "usuario",
  });

  Sorteo.belongsTo(Juego, { foreignKey: "IdJuego" });
  Juego.hasMany(Sorteo, { foreignKey: "IdJuego" });

  Ticket.belongsTo(Sorteo, { foreignKey: "IdSorteo" });
  Sorteo.hasMany(Ticket, { foreignKey: "IdSorteo" });

  Ticket.belongsTo(ModeloUsuario, { foreignKey: "IdUsuario" });
  ModeloUsuario.hasMany(Ticket, { foreignKey: "IdUsuario" });

  DetalleTicket.belongsTo(Ticket, { foreignKey: "IdTicket" });
  Ticket.hasMany(DetalleTicket, { foreignKey: "IdTicket" });

  ModeloUsuario.hasOne(Billetera, { foreignKey: "usuario", as: "billetera" });
  Billetera.belongsTo(ModeloUsuario, { foreignKey: "usuario", as: "usuarioRef" });
  Billetera.hasMany(Transaccion, { foreignKey: "billetera", as: "transacciones" });
  Transaccion.belongsTo(Billetera, { foreignKey: "billetera", as: "billeteraRef" });
}

const app = express();
const PORT = process.env.PORT || 3000;
app.set("port", PORT);

// Configuración de CORS más robusta
const whitelist = [
  process.env.FRONTEND_URL,
  "http://localhost:8080",
  "http://localhost:5173", // Vite dev server
  "http://localhost:4173", // Vite preview
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Documentación Swagger
if (swaggerUI && swaggerDoc) {
  app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerDoc));
  console.log(`Swagger disponible en http://localhost:${PORT}/api/docs`);
}

// Auth base
app.use(passport.initialize());

app.use("/api/auth", authRoutes);

// Rutas del repo (protegidas)
// Perfil de usuario (solo autenticación, sin checkRoleAccess)
app.get(
  "/api/apiUsuarios/perfil",
  authenticateToken,
  require("./controladores/controladorUsuario/controladorUsuarios").obtenerPerfil,
);
app.use("/api/apiUsuarios", authenticateToken, checkRoleAccess, rutasUsuarios);
app.use("/api/imagenesUsuarios", rutasImagenUsuario);
app.use("/api/apiUsuariosTelefonos", authenticateToken, checkRoleAccess, rutasTelefonosUsuarios);
app.use("/api/apiRoles", authenticateToken, checkRoleAccess, rutasRoles);
app.use("/api/apiRolesUsuarios", authenticateToken, checkRoleAccess, rutasRolesUsuarios);
app.use("/api/apiFunciones", authenticateToken, checkRoleAccess, rutasFunciones);
app.use("/api/apiFuncionesRoles", authenticateToken, checkRoleAccess, rutasFuncionesRoles);

// Archivos estáticos
app.use("/api/imagenes", express.static(path.join(__dirname, "../public/img")));

// Rutas de Lotería (pon autenticación si corresponde)
app.use("/api/juegos", authenticateToken, checkRoleAccess, juegoRutas);
app.use("/api/sorteos", authenticateToken, checkRoleAccess, sorteoRutas);
app.use("/api/tickets", authenticateToken, checkRoleAccess, ticketsRutas);
app.use("/api/detalle-tickets", authenticateToken, checkRoleAccess, detalleTicketRutas);

// Rutas públicas de PayPal (callbacks sin autenticación)
const billeteraControlador = require("./controladores/billetera.controlador");
app.get("/api/billetera/paypal/capturar", billeteraControlador.paypalCapturarOrdenRedirect);
app.get("/api/billetera/paypal/cancelar", billeteraControlador.paypalCancelarOrden);

// Rutas de billetera (requieren autenticación)
app.use("/api/billetera", authenticateToken, rutasBilletera);

(async () => {
  try {
    await db.authenticate();
    console.log("Conexión exitosa a la base de datos");

    // Declarar asociaciones antes del sync
    setupAssociations();

    // Helper de logs
    const syncStep = async (label, promise) => {
      await promise;
      console.log(`🧩 ${label} sincronizado correctamente`);
    };

    // === ORDEN: primero padres del repo
    await syncStep("Modelo Usuario", ModeloUsuario.sync({ alter: false }));
    await syncStep("Modelo Roles", ModeloRoles.sync({ alter: true }));
    await syncStep("Modelo Funciones", ModeloFunciones.sync({ alter: true }));

    // Luego hijas directas
    await syncStep("Modelo TelefonosUsuarios", ModeloTelefonosUsuarios.sync({ alter: true }));
    await syncStep("Modelo ImagenesUsuarios", ModeloImagenUsuario.sync({ alter: true }));

    // Luego tablas puente del repo
    await syncStep("Modelo RolesUsuarios", ModeloRolesUsuarios.sync({ alter: true }));
    await syncStep("Modelo FuncionesRoles", ModeloFuncionesRoles.sync({ alter: true }));

    // Sincronización Billetera
    await syncStep("Modelo Billetera", Billetera.sync({ alter: true }));
    await syncStep("Modelo Transaccion", Transaccion.sync({ alter: true }));

    // === Lotería: primero padres, luego hijas
    await syncStep("Modelo Juego", Juego.sync({ alter: true }));
    await syncStep("Modelo Sorteo", Sorteo.sync({ alter: false }));
    await syncStep("Modelo Ticket", Ticket.sync({ alter: true }));
    await syncStep("Modelo DetalleTicket", DetalleTicket.sync({ alter: true }));

    console.log("✅ Sincronización de modelos finalizada");

    // Ejecutar seeders después de sincronizar
    const { seedRolesYFunciones } = require("./configuracion/seeders");
    await seedRolesYFunciones();
  } catch (err) {
    console.error("Error al conectar o sincronizar:", err);
  }
})();

// Levantar servidor + Scheduler

app.listen(app.get("port"), () => {
  console.log("Servidor Funcionando en puerto " + app.get("port"));
  try {
    const { startScheduler } = require("./jobs/scheduler");
    startScheduler();
  } catch (e) {
    console.warn("Scheduler no iniciado:", e.message);
  }
});

module.exports = app;
