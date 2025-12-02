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
  { fncod: 'VER_SORTEOS', fndsc: 'Ver sorteos disponibles', fnest: 'AC' },
  { fncod: 'COMPRAR_TICKET', fndsc: 'Comprar tickets de lotería', fnest: 'AC' },
  { fncod: 'VER_MIS_TICKETS', fndsc: 'Ver mis tickets', fnest: 'AC' },
  { fncod: 'GESTIONAR_BILLETERA', fndsc: 'Gestionar billetera', fnest: 'AC' },
  { fncod: 'ADMIN_USUARIOS', fndsc: 'Administrar usuarios', fnest: 'AC' },
  { fncod: 'ADMIN_SORTEOS', fndsc: 'Administrar sorteos', fnest: 'AC' },
  { fncod: 'ADMIN_JUEGOS', fndsc: 'Administrar juegos', fnest: 'AC' },
  { fncod: 'VER_REPORTES', fndsc: 'Ver reportes del sistema', fnest: 'AC' }
];

const funcionesPorRol = {
  PBL: ['VER_SORTEOS', 'COMPRAR_TICKET', 'VER_MIS_TICKETS', 'GESTIONAR_BILLETERA'],
  USR: ['VER_SORTEOS', 'COMPRAR_TICKET', 'VER_MIS_TICKETS', 'GESTIONAR_BILLETERA'],
  ADM: ['VER_SORTEOS', 'COMPRAR_TICKET', 'VER_MIS_TICKETS', 'GESTIONAR_BILLETERA', 'ADMIN_USUARIOS', 'ADMIN_SORTEOS', 'ADMIN_JUEGOS', 'VER_REPORTES']
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
