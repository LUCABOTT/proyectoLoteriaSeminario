const express = require('express');
const router = express.Router();
const authController = require('../controladores/authControlador');
const passport = require('../configuracion/passport');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/confirmarCuenta',authController.confirmarUsuario)
router.post('/reactivarCuenta', authController.reactivarCuenta);
router.post('/pinreactivacion',authController.generarPinReactivacion)

// Ruta para iniciar login con Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Ruta de callback después del login
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    res.json({
      message: 'Inicio de sesión con Google exitoso',
      user: req.user.user,
      token: req.user.token
    });
  }
);

module.exports = router;
