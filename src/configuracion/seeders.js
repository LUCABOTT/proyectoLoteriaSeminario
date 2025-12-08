const Roles = require('../modelos/modelosUsuarios/roles');
const Funciones = require('../modelos/modelosUsuarios/funciones');
const FuncionesRoles = require('../modelos/modelosUsuarios/funciones_roles');

const rolesIniciales = [
  {
    rolescod: 'PBL',
    rolesdsc: 'Público',
    rolesest: 'AC'
  },
  {
    rolescod: 'ADM',
    rolesdsc: 'Administrador',
    rolesest: 'AC'
  },
  {
    rolescod: 'USR',
    rolesdsc: 'Usuario',
    rolesest: 'AC'
  }
];

const funcionesIniciales = [
  // Rutas de Usuarios
  { fncod: '/api/apiUsuarios/listar', fndsc: 'Listar usuarios', fnest: 'AC' },
  { fncod: '/api/apiUsuarios/guardar', fndsc: 'Crear usuario', fnest: 'AC' },
  { fncod: '/api/apiUsuarios/editar', fndsc: 'Editar usuario', fnest: 'AC' },
  { fncod: '/api/apiUsuarios/eliminar', fndsc: 'Eliminar usuario', fnest: 'AC' },
  { fncod: '/api/apiUsuarios/editar-telefonos', fndsc: 'Editar teléfonos', fnest: 'AC' },
  
  // Rutas de Roles
  { fncod: '/api/apiRoles/listar', fndsc: 'Listar roles', fnest: 'AC' },
  { fncod: '/api/apiRoles/guardar', fndsc: 'Crear rol', fnest: 'AC' },
  { fncod: '/api/apiRoles/editar', fndsc: 'Editar rol', fnest: 'AC' },
  { fncod: '/api/apiRoles/eliminar', fndsc: 'Eliminar rol', fnest: 'AC' },
  
  // Rutas de Funciones
  { fncod: '/api/apiFunciones/listar', fndsc: 'Listar funciones', fnest: 'AC' },
  { fncod: '/api/apiFunciones/guardar', fndsc: 'Crear función', fnest: 'AC' },
  { fncod: '/api/apiFunciones/editar', fndsc: 'Editar función', fnest: 'AC' },
  { fncod: '/api/apiFunciones/eliminar', fndsc: 'Eliminar función', fnest: 'AC' },
  
  // Rutas de Roles-Usuarios
  { fncod: '/api/apiRolesUsuarios/listar', fndsc: 'Listar roles de usuarios', fnest: 'AC' },
  { fncod: '/api/apiRolesUsuarios/guardar', fndsc: 'Asignar rol a usuario', fnest: 'AC' },
  { fncod: '/api/apiRolesUsuarios/editar', fndsc: 'Editar rol de usuario', fnest: 'AC' },
  { fncod: '/api/apiRolesUsuarios/eliminar', fndsc: 'Eliminar rol de usuario', fnest: 'AC' },
  
  // Rutas de Funciones-Roles
  { fncod: '/api/apiFuncionesRoles/listar', fndsc: 'Listar funciones de roles', fnest: 'AC' },
  { fncod: '/api/apiFuncionesRoles/guardar', fndsc: 'Asignar función a rol', fnest: 'AC' },
  { fncod: '/api/apiFuncionesRoles/editar', fndsc: 'Editar función de rol', fnest: 'AC' },
  { fncod: '/api/apiFuncionesRoles/eliminar', fndsc: 'Eliminar función de rol', fnest: 'AC' },
  
  // Rutas públicas/usuario
  { fncod: '/api/sorteos/activos', fndsc: 'Ver sorteos activos', fnest: 'AC' },
  { fncod: '/api/tickets/comprar', fndsc: 'Comprar ticket', fnest: 'AC' },
  { fncod: '/api/tickets/mis-tickets', fndsc: 'Ver mis tickets', fnest: 'AC' },
  { fncod: '/api/billetera/saldo', fndsc: 'Ver saldo billetera', fnest: 'AC' },
  { fncod: '/api/billetera/recargar', fndsc: 'Recargar billetera', fnest: 'AC' }
];

const funcionesPorRol = {
  PBL: [
    '/api/sorteos/activos',
    '/api/tickets/comprar',
    '/api/tickets/mis-tickets',
    '/api/billetera/saldo',
    '/api/billetera/recargar'
  ],
  USR: [
    '/api/sorteos/activos',
    '/api/tickets/comprar',
    '/api/tickets/mis-tickets',
    '/api/billetera/saldo',
    '/api/billetera/recargar'
  ],
  ADM: [
    // Admin tiene acceso a TODO
    '/api/apiUsuarios/listar',
    '/api/apiUsuarios/guardar',
    '/api/apiUsuarios/editar',
    '/api/apiUsuarios/eliminar',
    '/api/apiUsuarios/editar-telefonos',
    '/api/apiRoles/listar',
    '/api/apiRoles/guardar',
    '/api/apiRoles/editar',
    '/api/apiRoles/eliminar',
    '/api/apiFunciones/listar',
    '/api/apiFunciones/guardar',
    '/api/apiFunciones/editar',
    '/api/apiFunciones/eliminar',
    '/api/apiRolesUsuarios/listar',
    '/api/apiRolesUsuarios/guardar',
    '/api/apiRolesUsuarios/editar',
    '/api/apiRolesUsuarios/eliminar',
    '/api/apiFuncionesRoles/listar',
    '/api/apiFuncionesRoles/guardar',
    '/api/apiFuncionesRoles/editar',
    '/api/apiFuncionesRoles/eliminar',
    '/api/sorteos/activos',
    '/api/tickets/comprar',
    '/api/tickets/mis-tickets',
    '/api/billetera/saldo',
    '/api/billetera/recargar'
  ]
};

const seedRolesYFunciones = async () => {
  try {
    // Seed Roles
    for (const rol of rolesIniciales) {
      const [rolCreado, created] = await Roles.findOrCreate({
        where: { rolescod: rol.rolescod },
        defaults: rol
      });
      if (created) {
        console.log(`✅ Rol creado: ${rol.rolescod} - ${rol.rolesdsc}`);
      }
    }

    // Seed Funciones
    for (const funcion of funcionesIniciales) {
      const [funcionCreada, created] = await Funciones.findOrCreate({
        where: { fncod: funcion.fncod },
        defaults: funcion
      });
      if (created) {
        console.log(`✅ Función creada: ${funcion.fncod}`);
      }
    }

    // Asignar funciones a roles
    for (const [rolescod, funciones] of Object.entries(funcionesPorRol)) {
      for (const fncod of funciones) {
        const [asignacion, created] = await FuncionesRoles.findOrCreate({
          where: { rolescod, fncod },
          defaults: { 
            rolescod, 
            fncod,
            fnrolest: 'AC'
          }
        });
        if (created) {
          console.log(`✅ Función ${fncod} asignada a rol ${rolescod}`);
        }
      }
    }

    console.log('🎉 Seed de roles y funciones completado');
  } catch (error) {
    console.error('❌ Error en seed de roles y funciones:', error);
  }
};

module.exports = { seedRolesYFunciones };
