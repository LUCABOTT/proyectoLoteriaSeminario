const express = require('express');
const morgan = require('morgan');
const db = require('./configuracion/db');
const ModeloUsuario = require('./modelos/modelosUsuarios/usuarios');
const ModeloImagenUsuario = require ('./modelos/modelosUsuarios/imagenes')
const ModeloTelefonosUsuarios = require('./modelos/modelosUsuarios/telefonoUsuario');
const ModeloRoles = require('./modelos/modelosUsuarios/roles');
const ModeloRolesUsuarios = require('./modelos/modelosUsuarios/roles_usuarios');
const ModeloFunciones = require('./modelos/modelosUsuarios/funciones');
const ModeloFuncionesRoles = require('./modelos/modelosUsuarios/funciones_roles');
const swaggerUI = require('swagger-ui-express');
const path = require('path');
require('dotenv').config();

const app = express();
// Función asíncrona principal
(async () => {
  try {
    await db.authenticate();
    console.log('Conexión exitosa a la base de datos');

   ModeloUsuario.hasMany(ModeloTelefonosUsuarios, {
      foreignKey: 'idUsuario',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    ModeloTelefonosUsuarios.belongsTo(ModeloUsuario, {
      foreignKey: 'idUsuario'
    });

      ModeloUsuario.belongsToMany(ModeloRoles, {
      through: ModeloRolesUsuarios,
      foreignKey: 'usercod',
      otherKey: 'rolescod'
    });
    ModeloRoles.belongsToMany(ModeloUsuario, {
      through: ModeloRolesUsuarios,
      foreignKey: 'rolescod',
      otherKey: 'usercod'
    });

      ModeloRoles.belongsToMany(ModeloFunciones, {
      through: ModeloFuncionesRoles,
      foreignKey: 'rolescod',
      otherKey: 'fncod'  
      });
      ModeloFunciones.belongsToMany(ModeloRoles, {
      through: ModeloFuncionesRoles,
      foreignKey: 'fncod',
      otherKey: 'rolescod'
      });


      ModeloUsuario.hasMany(ModeloImagenUsuario, {
      foreignKey: 'usuarioId',
      as: 'imagenes',           // Alias para poder usar include
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
      });
      ModeloImagenUsuario.belongsTo(ModeloUsuario, {
        foreignKey: 'usuarioId',
        as: 'usuario'
      });


    await ModeloUsuario.sync({ alter: true });
    console.log('🧩 Modelo Usuario sincronizado correctamente');
    await ModeloImagenUsuario.sync({ alter: true});
    console.log('Modelo Imagenes Usuarios sincronizada correctamente');

     await ModeloTelefonosUsuarios.sync({ alter: true });
    console.log('🧩 Modelo TelefonosUsuarios sincronizado correctamente');
     await ModeloRoles.sync({ alter: true });
    console.log('🧩 Modelo Roles sincronizado correctamente');
     await ModeloRolesUsuarios.sync({ alter: true });
    console.log('🧩 Modelo RolesUsuarios sincronizado correctamente');
     await ModeloFunciones.sync({ alter: true });
    console.log('🧩 Modelo Funciones sincronizado correctamente');
     await ModeloFuncionesRoles.sync({ alter: true });
    console.log('🧩 Modelo FuncionesRoles incronizado correctamente');



    } catch (err) {
    console.error('Error al conectar o sincronizar:', err);
  }
})();

// Configuración
const PORT = process.env.PORT || 3001;
app.set('port', PORT);

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/apiUsuarios', require('./rutas/rutasUsuarios/rutaUsuarios'));
app.use('/api/apiImagenesUsuarios', require('./rutas/rutasUsuarios/rutasImagenUsuario'));
app.use('/api/apiUsuariosTelefonos', require('./rutas/rutasUsuarios/rutasTelefonosUsuarios'));
app.use('/api/apiRoles', require('./rutas/rutasUsuarios/rutasRoles'));
app.use('/api/apiRolesUsuarios', require('./rutas/rutasUsuarios/rutasRolesUsuarios'));
app.use('/api/apiFunciones', require('./rutas/rutasUsuarios/rutasFunciones'));
app.use('/api/apiFuncionesRoles', require('./rutas/rutasUsuarios/rutasFuncionesRoles'));

app.use('/api/imagenes', express.static(path.join(__dirname, '../public/img')))

// Levantar servidor
app.listen(app.get('port'), () => {
  console.log('Servidor Funcionando en puerto ' + app.get('port'));
});
