// ----------------------------------------
// 1) Variables de entorno primero
// ----------------------------------------
require('dotenv').config();

// ----------------------------------------
// 2) Imports base
// ----------------------------------------
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const db = require('./configuracion/db');

// Swagger (opcional, protegido)
let swaggerUI, swaggerDoc;
try {
  swaggerUI = require('swagger-ui-express');
  swaggerDoc = require('./configuracion/swagger');
} catch {
  /* sin swagger */
}

// ----------------------------------------
// 3) Modelos del repo (usuarios/roles/funciones/...)
// ----------------------------------------
const ModeloUsuario = require('./modelos/modelosUsuarios/usuarios');
const ModeloImagenUsuario = require('./modelos/modelosUsuarios/imagenes');
const ModeloTelefonosUsuarios = require('./modelos/modelosUsuarios/telefonoUsuario');
const ModeloRoles = require('./modelos/modelosUsuarios/roles');
const ModeloRolesUsuarios = require('./modelos/modelosUsuarios/roles_usuarios');
const ModeloFunciones = require('./modelos/modelosUsuarios/funciones');
const ModeloFuncionesRoles = require('./modelos/modelosUsuarios/funciones_roles');

// ----------------------------------------
// 4) Modelos de Lotería
// ----------------------------------------
const Juego = require('./modelos/juegoModelo');
const Sorteo = require('./modelos/sorteoModelo');
const Ticket = require('./modelos/ticketsModelo');
const DetalleTicket = require('./modelos/detalleTicketModelo');

// ----------------------------------------
// 5) Middlewares y rutas existentes del repo
// ----------------------------------------
const authenticateToken = require('./middlewares/auth');
const authRoutes = require('./rutas/auth');

// Rutas de usuarios (repo)
const rutasUsuarios = require('./rutas/rutasUsuarios/rutaUsuarios');
const rutasImagenUsuario = require('./rutas/rutasUsuarios/rutasImagenUsuario');
const rutasTelefonosUsuarios = require('./rutas/rutasUsuarios/rutasTelefonosUsuarios');
const rutasRoles = require('./rutas/rutasUsuarios/rutasRoles');
const rutasRolesUsuarios = require('./rutas/rutasUsuarios/rutasRolesUsuarios');
const rutasFunciones = require('./rutas/rutasUsuarios/rutasFunciones');
const rutasFuncionesRoles = require('./rutas/rutasUsuarios/rutasFuncionesRoles');

// Rutas de Lotería
const juegoRutas = require('./rutas/juegoRutas');
const sorteoRutas = require('./rutas/sorteoRutas');
const ticketsRutas = require('./rutas/ticketsRutas');
const detalleTicketRutas = require('./rutas/detalleTicketRutas');

// ----------------------------------------
// 6) Asociaciones (declarar ANTES del sync)
// ----------------------------------------
function setupAssociations() {
  // ===== Repo: Usuarios 1—N Teléfonos
  ModeloUsuario.hasMany(ModeloTelefonosUsuarios, {
    foreignKey: 'idUsuario',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ModeloTelefonosUsuarios.belongsTo(ModeloUsuario, { foreignKey: 'idUsuario' });

  // ===== Repo: Usuarios N—M Roles (tabla puente: roles_usuarios)
  ModeloUsuario.belongsToMany(ModeloRoles, {
    through: ModeloRolesUsuarios,
    foreignKey: 'usercod',
    otherKey: 'rolescod',
  });
  ModeloRoles.belongsToMany(ModeloUsuario, {
    through: ModeloRolesUsuarios,
    foreignKey: 'rolescod',
    otherKey: 'usercod',
  });

  // ===== Repo: Roles N—M Funciones (tabla puente: funciones_roles)
  ModeloRoles.belongsToMany(ModeloFunciones, {
    through: ModeloFuncionesRoles,
    foreignKey: 'rolescod',
    otherKey: 'fncod',
  });
  ModeloFunciones.belongsToMany(ModeloRoles, {
    through: ModeloFuncionesRoles,
    foreignKey: 'fncod',
    otherKey: 'rolescod',
  });

  // ===== Repo: Usuarios 1—N Imágenes (alias)
  ModeloUsuario.hasMany(ModeloImagenUsuario, {
    foreignKey: 'usuarioId',
    as: 'imagenes',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ModeloImagenUsuario.belongsTo(ModeloUsuario, {
    foreignKey: 'usuarioId',
    as: 'usuario',
  });

  // ===== Lotería: Juego 1—N Sorteos
  Sorteo.belongsTo(Juego, { foreignKey: 'IdJuego' });
  Juego.hasMany(Sorteo, { foreignKey: 'IdJuego' });

  // ===== Lotería: Sorteo 1—N Tickets
  Ticket.belongsTo(Sorteo, { foreignKey: 'IdSorteo' });
  Sorteo.hasMany(Ticket, { foreignKey: 'IdSorteo' });

  // ===== Lotería: Usuario 1—N Tickets (FK a usuarios.id del repo)
  Ticket.belongsTo(ModeloUsuario, { foreignKey: 'IdUsuario' });
  ModeloUsuario.hasMany(Ticket, { foreignKey: 'IdUsuario' });

  // ===== Lotería: Ticket 1—N DetalleTicket
  DetalleTicket.belongsTo(Ticket, { foreignKey: 'IdTicket' });
  Ticket.hasMany(DetalleTicket, { foreignKey: 'IdTicket' });
}

// ----------------------------------------
// 7) App Express
// ----------------------------------------
const app = express();
const PORT = process.env.PORT || 3004;
app.set('port', PORT);

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Swagger UI si está disponible
if (swaggerUI && swaggerDoc) {
  app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));
  console.log('Swagger UI montado en /api/docs');
}

// Auth base
app.use('/auth', authRoutes);

// Rutas del repo (protegidas)
app.use('/api/apiUsuarios', authenticateToken, rutasUsuarios);
app.use('/api/apiImagenesUsuarios', authenticateToken, rutasImagenUsuario);
app.use('/api/apiUsuariosTelefonos', authenticateToken, rutasTelefonosUsuarios);
app.use('/api/apiRoles', authenticateToken, rutasRoles);
app.use('/api/apiRolesUsuarios', authenticateToken, rutasRolesUsuarios);
app.use('/api/apiFunciones', authenticateToken, rutasFunciones);
app.use('/api/apiFuncionesRoles', authenticateToken, rutasFuncionesRoles);

// Archivos estáticos
app.use('/api/imagenes', express.static(path.join(__dirname, '../public/img')));

// Rutas de Lotería (pon autenticación si corresponde)
app.use('/api/juegos', /*authenticateToken,*/ juegoRutas);
app.use('/api/sorteos', /*authenticateToken,*/ sorteoRutas);
app.use('/api/tickets', /*authenticateToken,*/ ticketsRutas);
app.use('/api/detalle-tickets', /*authenticateToken,*/ detalleTicketRutas);

// ----------------------------------------
// 8) Bootstrap BD + Sync INDIVIDUAL en orden
// ----------------------------------------
(async () => {
  try {
    await db.authenticate();
    console.log('Conexión exitosa a la base de datos');

    // Declarar asociaciones antes del sync
    setupAssociations();

    // Helper de logs
    const syncStep = async (label, promise) => {
      await promise;
      console.log(`🧩 ${label} sincronizado correctamente`);
    };

    // === ORDEN: primero padres del repo
    await syncStep('Modelo Usuario', ModeloUsuario.sync({ alter: true }));
    await syncStep('Modelo Roles', ModeloRoles.sync({ alter: true }));
    await syncStep('Modelo Funciones', ModeloFunciones.sync({ alter: true }));

    // Luego hijas directas
    await syncStep('Modelo TelefonosUsuarios', ModeloTelefonosUsuarios.sync({ alter: true }));
    await syncStep('Modelo ImagenesUsuarios', ModeloImagenUsuario.sync({ alter: true }));

    // Luego tablas puente del repo
    await syncStep('Modelo RolesUsuarios', ModeloRolesUsuarios.sync({ alter: true }));
    await syncStep('Modelo FuncionesRoles', ModeloFuncionesRoles.sync({ alter: true }));

    // === Lotería: primero padres, luego hijas
    await syncStep('Modelo Juego', Juego.sync({ alter: true }));
    await syncStep('Modelo Sorteo', Sorteo.sync({ alter: true }));
    await syncStep('Modelo Ticket', Ticket.sync({ alter: true }));
    await syncStep('Modelo DetalleTicket', DetalleTicket.sync({ alter: true }));

    console.log('✅ Sincronización de modelos finalizada');
  } catch (err) {
    console.error('Error al conectar o sincronizar:', err);
  }
})();

// ----------------------------------------
// 9) Levantar servidor + Scheduler
// ----------------------------------------
app.listen(app.get('port'), () => {
  console.log('Servidor Funcionando en puerto ' + app.get('port'));
  try {
    const { startScheduler } = require('./jobs/scheduler');
    startScheduler();
  } catch (e) {
    console.warn('Scheduler no iniciado:', e.message);
  }
});

module.exports = app;
