const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Usuarios = require('../modelos/modelosUsuarios/usuarios');
const Roles = require('../modelos/modelosUsuarios/roles');
const RolesUsuarios = require('../modelos/modelosUsuarios/roles_usuarios');
const enviarCorreo = require('../configuracion/correo');

const registrarUsuario = async (data) => {
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
  } = data;

    // Verificar si ya existe el correo
    const exists = await Usuarios.findOne({ where: { useremail } });
    if (exists) throw new Error('Correo no es Valido, Ya existe');

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(userpswd, 10);

    const fechaActual = new Date();
    const fechaExpiracion = new Date(fechaActual);
    fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 3);
    const pinActivacion = generarPIN();

    // Crear usuario
    const user = await Usuarios.create({
        primerNombre,
        segundoNombre,
        primerApellido,
        segundoApellido,
        identidad,
        useremail,
        userpswd: hashedPassword,
        userfching: new Date(),
        userest: 'IN',
        userpswdexp: fechaExpiracion,
        useractcod: pinActivacion,
        usertipo: 'PBL',
        fechaNacimiento: fechaNacimiento || null
    });

    const rolPublico = await Roles.findOne({ where: { rolescod: 'PBL' } });

  if (!rolPublico) {
    throw new Error('No existe el rol PBL en la tabla de roles');
  }

  const fechaRol = new Date();
const expiracionRol = new Date(fechaRol);
expiracionRol.setMonth(expiracionRol.getMonth() + 3);

await RolesUsuarios.create({
  usercod: user.id,
  rolescod: rolPublico.rolescod,
  roleuserest: 'IN',        
  roleuserfch: fechaRol,     
  roleuserexp: expiracionRol
});


     await enviarCorreo(useremail, 'Código de activación', `Tu código de activación es: ${pinActivacion}`);

    return user;
};

const loginUser = async (useremail, userpswd) => {
    const user = await Usuarios.findOne({ where: { useremail } });
    if (!user) throw new Error('Usuario Incorrecto');

     // Verificar expiración de contraseña
    const ahora = new Date();
    if (user.userpswdexp && ahora > user.userpswdexp) {
        // Expiró la contraseña
        user.userest = 'IN'; // poner usuario inactivo
        //user.useractcod = generarPIN(); // generar nuevo PIN
        await user.save();

        /*await enviarCorreo(user.useremail, 'Cuenta expirada',  este es apra enviar pin automatico a email del usuario pero ya no
          `Tu cuenta ha expirado. Usa este PIN para reactivar: ${user.useractcod}`);*/

        throw new Error('Cuenta expirada. Revisa tu correo para reactivarla.');
    }

    if (user.userest === 'BL') {
    throw new Error('La cuenta está bloqueada. Contacte al administrador.');
}

    // Verificar que esté activo
    if (user.userest !== 'AC') throw new Error('Usuario no activo');


    const valid = await bcrypt.compare(userpswd, user.userpswd);
    if (!valid) throw new Error('contraseña Incorrecta');

    const token = jwt.sign(
        { id: user.id, email: user.useremail, tipo: user.usertipo },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
    );

    return token;
}; 

function generarPIN(length = 6) {
  // Genera un PIN numérico de 6 dígitos
  return crypto.randomInt(0, 10**length).toString().padStart(length, '0');
}


module.exports = { registrarUsuario, loginUser, generarPIN };