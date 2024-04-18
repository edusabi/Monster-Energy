const LocalStrategy = require('passport-local').Strategy;
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

require("../model/registro");
const Usuario = mongoose.model("RegistroUser");

module.exports = function(passport){
    passport.use(new LocalStrategy({usernameField: "email"}, (email, password, done) => {
        Usuario.findOne({ email: email }).then((usuario) => {
            if (!usuario) {
                return done(null, false, { message: "Essa conta não existe" }); // Ajuste aqui
            }

            bcrypt.compare(password, usuario.password, (erro, batem) => {
                if (batem) {
                    return done(null, usuario);
                } else {
                    return done(null, false, { message: "Senha incorreta!" }); // Está correto
                }
            });
        });
    }));

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await Usuario.findOne({ _id: id });
            if (!user) throw new Error("USER NOT FOUND!");
            done(null, user);
        } catch (err) {
            console.log(err);
            done(err, null);
        }
    });
};
