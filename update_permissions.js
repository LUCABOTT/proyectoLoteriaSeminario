const Funciones = require('./src/modelos/modelosUsuarios/funciones');
const FuncionesRoles = require('./src/modelos/modelosUsuarios/funciones_roles');

async function updatePermissions() {
  try {
    console.log('🔄 Actualizando permisos en la base de datos...\n');

    // Funciones a actualizar/crear para RolesUsuarios
    const funcionesRolesUsuarios = [
      { fncod: '/api/apiRolesUsuarios/listar', fndsc: 'Listar roles de usuarios', fnest: 'AC' },
      { fncod: '/api/apiRolesUsuarios/guardar', fndsc: 'Asignar rol a usuario', fnest: 'AC' },
      { fncod: '/api/apiRolesUsuarios/editar', fndsc: 'Editar rol de usuario', fnest: 'AC' },
      { fncod: '/api/apiRolesUsuarios/eliminar', fndsc: 'Eliminar rol de usuario', fnest: 'AC' }
    ];

    // Funciones a actualizar/crear para FuncionesRoles
    const funcionesFuncionesRoles = [
      { fncod: '/api/apiFuncionesRoles/listar', fndsc: 'Listar funciones de roles', fnest: 'AC' },
      { fncod: '/api/apiFuncionesRoles/guardar', fndsc: 'Asignar función a rol', fnest: 'AC' },
      { fncod: '/api/apiFuncionesRoles/editar', fndsc: 'Editar función de rol', fnest: 'AC' },
      { fncod: '/api/apiFuncionesRoles/eliminar', fndsc: 'Eliminar función de rol', fnest: 'AC' }
    ];

    const todasFunciones = [...funcionesRolesUsuarios, ...funcionesFuncionesRoles];

    // Insertar o actualizar funciones
    for (const fn of todasFunciones) {
      const [funcion, created] = await Funciones.upsert(fn, { returning: true });
      console.log(`${created ? '✅ Creada' : '✅ Actualizada'} función: ${fn.fncod}`);
    }

    console.log('\n🔄 Asignando permisos al rol ADM...\n');

    // Asignar todas estas funciones al rol ADM
    for (const fn of todasFunciones) {
      const [relacion, created] = await FuncionesRoles.upsert({
        rolescod: 'ADM',
        fncod: fn.fncod,
        fnrolest: 'AC'
      }, { returning: true });
      console.log(`${created ? '✅ Creada' : '✅ Actualizada'} asignación: ${fn.fncod} → ADM`);
    }

    console.log('\n✅ ¡Permisos actualizados exitosamente!');
    console.log('📝 Funciones actualizadas:', todasFunciones.length);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updatePermissions();
