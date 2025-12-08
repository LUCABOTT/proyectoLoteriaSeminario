const express = require("express");
const router = express.Router();
const authController = require("../controladores/authControlador");
const passport = require("../configuracion/passport");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/confirmarCuenta", authController.confirmarUsuario);
router.post("/reactivarCuenta", authController.reactivarCuenta);
router.post("/pinreactivacion", authController.generarPinReactivacion);
router.post("/solicitar-reset", authController.solicitarResetPassword);
router.post("/cambiar-contrasena",authController.cambiarContrasena)

const checkGoogleOAuthConfig = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      error: "Google OAuth no está configurado",
      message: "Las credenciales de Google OAuth no están disponibles. Contacte al administrador.",
    });
  }
  next();
};

// Ruta para iniciar login con Google
router.get("/google", checkGoogleOAuthConfig, passport.authenticate("google", { scope: ["profile", "email"] }));

// Ruta de callback después del login
router.get(
  "/google/callback",
  checkGoogleOAuthConfig,
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const frontendURL = "http://localhost:8080/google/callback";
    const token = req.user.token;
    const user = encodeURIComponent(JSON.stringify(req.user.user));

    // Redirige a tu frontend pasando token y user
    res.redirect(`${frontendURL}?token=${token}&user=${user}`);
  }
);

module.exports = router;
