const express = require("express");
const router = express.Router();
const authController = require("../controladores/authControlador");
const passport = require("../configuracion/passport");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/confirmarCuenta", authController.confirmarUsuario);
router.post("/reactivarCuenta", authController.reactivarCuenta);
router.post("/pinreactivacion", authController.generarPinReactivacion);

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
    res.json({
      message: "Inicio de sesión con Google exitoso",
      user: req.user.user,
      token: req.user.token,
    });
  },
);

module.exports = router;
