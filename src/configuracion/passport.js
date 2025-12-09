const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Usuarios = require("../modelos/modelosUsuarios/usuarios");
const Roles = require("../modelos/modelosUsuarios/roles");
const RolesUsuarios = require("../modelos/modelosUsuarios/roles_usuarios");
const Billetera = require("../modelos/billetera.modelo");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `http://localhost:${process.env.PORT}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const useremail = profile.emails[0].value;
          let user = await Usuarios.findOne({ where: { useremail: useremail } });

          if (!user) {
            const dummyPassword = await bcrypt.hash("GOOGLE_AUTH", 10);

            user = await Usuarios.create({
              primerNombre: profile.name.givenName,
              primerApellido: profile.name.familyName,
              useremail: useremail,
              userpswd: dummyPassword,
              userfching: new Date(),
              userest: "AC",
              userpswdexp: null,
              useractcod: null,
              usertipo: "PBL",
            });

            // Asignar rol PBL al nuevo usuario
            const rolPublico = await Roles.findOne({ where: { rolescod: "PBL" } });
            if (rolPublico) {
              await RolesUsuarios.create({
                usercod: user.id,
                rolescod: rolPublico.rolescod,
                roleuserest: "AC",
                roleuserfch: new Date(),
                roleuserexp: null,
              });
            }

            // Crear billetera para el nuevo usuario
            await Billetera.create({
              usuario: user.id,
              saldo: 0,
              estado: "Activa",
            });
          }

          // Obtener roles activos del usuario
          const rolesUsuarios = await RolesUsuarios.findAll({
            where: {
              usercod: user.id,
              roleuserest: "AC",
            },
          });

          const roles = rolesUsuarios.map((ru) => ru.rolescod);

          const token = jwt.sign(
            { id: user.id, email: user.useremail, tipo: user.usertipo, roles },
            process.env.JWT_SECRET,
            {
              expiresIn: process.env.JWT_EXPIRATION,
            },
          );

          return done(null, {
            user: {
              id: user.id,
              email: user.useremail,
              firstName: user.primerNombre,
              lastName: user.primerApellido,
              tipo: user.usertipo,
              roles,
            },
            token,
          });
        } catch (err) {
          done(err, null);
        }
      },
    ),
  );
} else {
  console.warn(
    "Las credenciales de Google OAuth no están configuradas. La autenticación de Google no estará disponible.",
  );
}

module.exports = passport;
