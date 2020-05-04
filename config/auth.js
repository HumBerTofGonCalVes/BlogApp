// jshint esversion: 6
const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const brcypt = require("bcryptjs");

//Model de Usuário
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

module.exports = function (passport) {
    passport.use(new localStrategy({
        usernameField: "email",
        passwordField: "password"
    }, (email, password, done) => {
        Usuario.findOne({
            email: email
        }).then((usuario) => {
            if (!usuario) {
                return done(null, false, {
                    message: "Esta conta não existe."
                });
            } else {
                brcypt.compare(password, usuario.password, (error, success) => {
                    if (success) {
                        return done(null, usuario);
                    } else {
                        return done(null, false, {
                            message: "Password incorreta."
                        });
                    }
                });
            }
        });
    }));

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id);
    });

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (e, usuario) => {
            done(e, usuario);
        });
    });
};