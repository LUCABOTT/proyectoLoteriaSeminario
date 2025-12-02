const authService = require("../services/authServices");
const Usuarios = require("../modelos/modelosUsuarios/usuarios");
const RolesUsuarios = require("../modelos/modelosUsuarios/roles_usuarios");
const enviarCorreo = require("../configuracion/correo");
const { generarPIN } = require("../services/authServices");

const register = async (req, res) => {
  try {
    const user = await authService.registrarUsuario(req.body);

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        id: user.id,
        email: user.useremail,
        nombreCompleto: `${user.primerNombre} ${user.primerApellido}`,
        tipo: user.usertipo,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { useremail, userpswd } = req.body;
    const result = await authService.loginUser(useremail, userpswd);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const confirmarUsuario = async (req, res) => {
  try {
    const { email, pin } = req.body;

    const usuario = await Usuarios.findOne({ where: { useremail: email } });

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    if (usuario.useractcod !== pin) return res.status(400).json({ error: "Código incorrecto" });

    usuario.userest = "AC";
    usuario.useractcod = null;
    await usuario.save();

    await RolesUsuarios.update({ roleuserest: "AC" }, { where: { usercod: usuario.id, rolescod: "PBL" } });

    res.json({ message: "Usuario activado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al activar usuario" });
  }
};

const generarPinReactivacion = async (req, res) => {
  try {
    const { useremail } = req.body;
    const usuario = await Usuarios.findOne({ where: { useremail: useremail } });

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    if (usuario.userest === "AC") return res.status(400).json({ error: "La cuenta ya está activa" });

    const nuevoPin = generarPIN();
    usuario.useractcod = nuevoPin;
    await usuario.save();

    await enviarCorreo(usuario.useremail, "PIN de reactivación", `Tu PIN para reactivar la cuenta es: ${nuevoPin}`);

    res.json({ message: "PIN de reactivación enviado al correo" });
  } catch (error) {
    console.error(error);
    console.error("Error interno al generar PIN:", error);
    res.status(500).json({ error: "Error al generar PIN de reactivación" });
  }
};

const reactivarCuenta = async (req, res) => {
  try {
    const { useremail, pin, nuevaContrasena } = req.body;

    const usuario = await Usuarios.findOne({ where: { useremail: useremail } });
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    if (usuario.useractcod !== pin) return res.status(400).json({ error: "Código incorrecto" });

    // Hashear nueva contraseña
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

    // Actualizar usuario
    usuario.userpswd = hashedPassword;
    usuario.userest = "AC"; // Reactivado
    usuario.useractcod = null;

    // Extender nueva fecha de expiración (3 meses más)
    const nuevaFechaExp = new Date();
    nuevaFechaExp.setMonth(nuevaFechaExp.getMonth() + 3);
    usuario.userpswdexp = nuevaFechaExp;

    await usuario.save();

    res.json({ message: "Cuenta reactivada correctamente. Ya puedes iniciar sesión." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al reactivar cuenta" });
  }
};

module.exports = { register, login, confirmarUsuario, reactivarCuenta, generarPinReactivacion };
