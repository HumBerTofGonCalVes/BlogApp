// jshint esversion: 6

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

router.get("/registo", (req, res) => {
    res.render("usuarios/registo");
});

router.post("/registo", (req, res) => {
    var erros = [];
    if (req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({
            texto: "Nome inválido!"
        });
    }
    if (req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({
            texto: "E-mail inválido!"
        });
    }
    if (req.body.password || typeof req.body.password == undefined || req.body.password == null) {
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
        res.render("/usuarios/registo", {erros: erros});
        req.flash("error_msg", texto);
    } else {

    }
});

module.exports = router;