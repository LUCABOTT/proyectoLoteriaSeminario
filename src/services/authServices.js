const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuarios = require('../modelos/modelosUsuarios/usuarios');

const registrarUsuario = async (data) => {
    const { useremail, userpswd, primerNombre, primerApellido } = data;

    // Verificar si ya existe el correo
    const exists = await Usuarios.findOne({ where: { useremail } });
    if (exists) throw new Error('Correo no es Valido, Ya existe');

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(userpswd, 10);

    // Crear usuario
    const user = await Usuarios.create({
        useremail,
        userpswd: hashedPassword,
        primerNombre,
        primerApellido
    });

    return user;
};

const loginUser = async (useremail, userpswd) => {
    const user = await Usuarios.findOne({ where: { useremail } });
    if (!user) throw new Error('Usuario Incorrecto');

    const valid = await bcrypt.compare(userpswd, user.userpswd);
    if (!valid) throw new Error('contraseña Incorrecta');

    const token = jwt.sign(
        { id: user.id, email: user.useremail, tipo: user.usertipo },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
    );

    return token;
};

module.exports = { registrarUsuario, loginUser };