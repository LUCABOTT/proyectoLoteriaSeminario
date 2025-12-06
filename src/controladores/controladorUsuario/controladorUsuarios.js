const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Usuarios = require('../../modelos/modelosUsuarios/usuarios');
const Roles = require('../../modelos/modelosUsuarios/roles')
const TelefonosUsuarios = require('../../modelos/modelosUsuarios/telefonoUsuario')
const RolesUsuarios = require('../../modelos/modelosUsuarios/roles_usuarios');
const Billetera = require('../../modelos/billetera.modelo');

// 🔹 Listar todos los usuarios
exports.listar = async (req, res) => {
 try {
    const lista = await Usuarios.findAll({
      include: [
        {
          model: TelefonosUsuarios,
          as: "telefonosusuarios",
          attributes: ["numero"]
        }
      ]
    });

    res.json(lista);

  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ msj: "Error al listar usuarios", error: error.message });
  }
};

// 🔹 Crear usuario
exports.guardar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const {
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      identidad,
      useremail,
      userpswd,
      userest,
      usertipo,
      fechaNacimiento,
      telefonos
    } = req.body;

    // 1️⃣ Validar si ya existe el correo
    const existe = await Usuarios.findOne({ where: { useremail } });
    if (existe) {
      return res.status(400).json({ msj: "Correo no válido, ya está registrado" });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(userpswd, 10);

    // 3️⃣ Generar fechas de expiración
    const fechaActual = new Date();
    const fechaExpiracion = new Date(fechaActual);
    fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 3);

  

    // 5️⃣ Crear usuario con datos similares al registro público
    const nuevoUsuario = await Usuarios.create({
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      identidad,
      useremail,
      userpswd: hashedPassword,
      userfching: new Date(),
      userest: userest || "IN",     // Por defecto INACTIVO
      userpswdexp: fechaExpiracion,
      useractcod: null,
      usertipo: usertipo || "ADM",  // Por defecto será ADMIN (o cámbialo como ocupes)
      fechaNacimiento: fechaNacimiento || null
    });

    // 6️⃣ Asignar rol según usertipo
    const buscarRol = await Roles.findOne({ where: { rolescod: nuevoUsuario.usertipo } });

    if (!buscarRol) {
      return res.status(400).json({ msj: `No existe el rol ${nuevoUsuario.usertipo}` });
    }

    const fechaRol = new Date();
    const expiracionRol = new Date(fechaRol);
    expiracionRol.setMonth(expiracionRol.getMonth() + 3);

    await RolesUsuarios.create({
      usercod: nuevoUsuario.id,
      rolescod: buscarRol.rolescod,
      roleuserest: 'AC',
      roleuserfch: fechaRol,
      roleuserexp: expiracionRol
    });

    // 7️⃣ Crear billetera
    await Billetera.create({
      usuario: nuevoUsuario.id,
      saldo: 0,
      estado: 'Activa'
    });

    // 8️⃣ Registrar teléfono
  if (telefonos && telefonos.length > 0) {
  const telefonosConUsuario = telefonos.map(t => ({
    numero: parseInt(t.numero.replace(/\D/g, "")),
    idUsuario: nuevoUsuario.id
  }));

  await TelefonosUsuarios.bulkCreate(telefonosConUsuario);
}

    return res.json({
      msj: "Usuario creado correctamente",
      data: nuevoUsuario
    });

  } catch (error) {
    console.error("Error al crear usuario administrador:", error);
    return res.status(500).json({
      msj: "Error interno al crear usuario",
      error: error.message
    });
  }
};


// 🔹 Editar usuario
exports.editar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { id, telefonos } = req.body;  // ✅ agregar telefonos aquí
    const {
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      identidad,
      useremail,
      userpswd,
      userfching,
      userest,
      userpswdexp,
      useractcod,
      usertipo,
      fechaNacimiento
    } = req.body;

    // Actualizar usuario
    const actualizado = await Usuarios.update(
      {
        primerNombre,
        segundoNombre,
        primerApellido,
        segundoApellido,
        identidad,
        useremail,
        userpswd,
        userfching,
        userest,
        userpswdexp,
        useractcod,
        usertipo,
        fechaNacimiento
      },
      { where: { id } }
    );

    if (actualizado[0] === 0) {
      return res.status(404).json({ msj: "Usuario no encontrado o sin cambios" });
    }

    // Manejar teléfonos
    if (telefonos && telefonos.length > 0) {
      await TelefonosUsuarios.destroy({ where: { idUsuario: id } });

      const telefonosConUsuario = telefonos.map(t => ({
        numero: parseInt(t.numero.replace(/\D/g, "")),
        idUsuario: id
      }));

      await TelefonosUsuarios.bulkCreate(telefonosConUsuario);
    }

    res.json({ msj: "Usuario actualizado correctamente" });

  } catch (error) {
    console.error("Error al editar usuario:", error);
    res.status(500).json({ msj: "Error al editar usuario", error: error.message });
  }
};


exports.editarTelefonos = async (req, res) => {
  const { idUsuario, telefonos } = req.body;

  if (!idUsuario) return res.status(400).json({ msj: "Falta el id del usuario" });

  try {
    // Traemos los teléfonos actuales
    const actuales = await TelefonosUsuarios.findAll({ where: { idUsuario } });

    // Hacemos arrays de números para comparar
    const numerosActuales = actuales.map(t => t.numero.toString());
    const numerosNuevos = telefonos.map(t => t.numero.toString());

    // 1️⃣ Borrar los que ya no están en el arreglo nuevo
    const aBorrar = numerosActuales.filter(n => !numerosNuevos.includes(n));
    if (aBorrar.length > 0) {
      await TelefonosUsuarios.destroy({
        where: { idUsuario, numero: aBorrar }
      });
    }

    // 2️⃣ Crear los nuevos que no estaban antes
    const aCrear = numerosNuevos.filter(n => !numerosActuales.includes(n));
    if (aCrear.length > 0) {
      const telefonosConUsuario = aCrear.map(n => ({ numero: parseInt(n), idUsuario }));
      await TelefonosUsuarios.bulkCreate(telefonosConUsuario);
    }

    res.json({ msj: "Teléfonos actualizados correctamente" });

  } catch (error) {
    console.error("Error al actualizar teléfonos:", error);
    res.status(500).json({ msj: "Error interno al actualizar teléfonos", error: error.message });
  }
};

// 🔹 Eliminar usuario
exports.eliminar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { id } = req.body;

    const eliminado = await Usuarios.destroy({ where: { id } });

    if (eliminado === 0) {
      return res.status(404).json({ msj: "Usuario no encontrado" });
    }

    res.json({ msj: "Usuario eliminado correctamente", data: eliminado });

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ msj: "Error al eliminar usuario", error: error.message });
  }
};

// 🔹 Obtener perfil del usuario autenticado
exports.obtenerPerfil = async (req, res) => {
  try {
    const userId = req.user.id;

    const usuario = await Usuarios.findByPk(userId, {
      attributes: { exclude: ['userpswd', 'useractcod'] }
    });

    if (!usuario) {
      return res.status(404).json({ msj: "Usuario no encontrado" });
    }

    res.json(usuario);

  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ msj: "Error al obtener perfil", error: error.message });
  }
};

