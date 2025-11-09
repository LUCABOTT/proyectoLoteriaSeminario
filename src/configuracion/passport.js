const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Usuarios = require('../modelos/modelosUsuarios/usuarios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3001/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const useremail = profile.emails[0].value;
    let user = await Usuarios.findOne({ where: { useremail: useremail } });

    // Si no existe, lo creamos
    if (!user) {
        const dummyPassword = await bcrypt.hash('GOOGLE_AUTH', 10);
        

      user = await Usuarios.create({
        primerNombre: profile.name.givenName,
        primerApellido: profile.name.familyName,
        useremail: useremail,
        userpswd: dummyPassword,
        userfching: new Date(),
        userest: 'AC',
        userpswdexp: null,
        useractcod: null,
        usertipo: 'PBL'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.useremail, tipo: user.usertipo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    return done(null, { user, token });
  } catch (err) {
    done(err, null);
  }
}));

module.exports = passport;
