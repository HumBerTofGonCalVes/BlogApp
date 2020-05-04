// jshint esversion: 6

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/registo", (req, res) => {
    res.render("./usuarios/registo");
});

router.post("/registo", (req, res) => {
    var erros = [];
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({
            texto: "Nome inválido!"
        });
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({
            texto: "E-mail inválido!"
        });
    }
    if (!req.body.password || typeof req.body.password == undefined || req.body.password == null) {
        erros.push({
            texto: "Password inválido!"
        });
    }
    if (req.body.password.length < 4) {
        erros.push({
            texto: "Senha muito curta!"
        });
    }
    if (req.body.password != req.body.password_2) {
        erros.push({
            texto: "As passwords são diferentes.\nTente novamente."
        });
    }
    if (erros.length > 0) {
        res.render("./usuarios/registo", {
            erros: erros
        });
    } else {
        Usuario.findOne({
            email: req.body.email
        }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe uma conta com este email no nosso sistema.");
                res.redirect("/usuarios/registo");
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    password: req.body.password
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(novoUsuario.password, salt, (err, hash) => {
                        if (err) {
                            req.flash("error_ms", "Ocorreu um erro durante a gravação do usuário.");
                            res.redirect("/home");
                        }
                        novoUsuario.password = hash;
                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso.");
                            res.redirect("/home");
                        }).catch((e) => {
                            req.flash("error_msg", "Ocorreu um erro ao criar o usuário. Por favor tente novamente.");
                            res.redirect("/usuarios/registo");
                        });
                    });
                });
            }
        }).catch((e) => {
            req.flash("error_msg", "Ocorreu um erro interno.");
            res.redirect("/home");
        });
    }
});

router.get("/login", (req, res) => {
    res.render("./usuarios/login");
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/usuarios/login",
        failureFlash: true,
        successFlash: "Bem vindo de volta!"
    })(req, res, next);
});

module.exports = router;