// jshint esversion: 6

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Posts");
const Post = mongoose.model("posts");

router.get('/', (req, res) => {
    res.redirect("/home");
});

router.get('/categorias', (req, res) => {
    Categoria.find().lean().sort({
        date: 'desc'
    }).then((categorias) => {
        res.render('admin/categorias', {
            categorias: categorias
        });
    }).catch((e) => {
        req.flash('error_msg', "Ocorreu um erro ao listar as categorias!");
        res.redirect('/');
    });
});

router.get('/categorias/add', (req, res) => {
    res.render('admin/addCategorias');
});

router.post('/categorias/nova', (req, res) => {
    let erros = [];
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({
            texto: "Nome inválido"
        });
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({
            texto: "Slug inválido"
        });
    }
    if (req.body.nome.length < 2) {
        erros.push({
            texto: 'Nome da categoria muito pequeno'
        });
    }
    if (erros.length > 0) {
        res.render("admin/addCategorias", {
            erros: erros
        });
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        };
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!");
            res.redirect('/categorias');
        }).catch((e) => {
            req.flash("error_msg", "Ocorreu um erro ao tentar guardar a categoria.\nTente Novamente!");
            res.redirect("/categorias/add");
        });
    }
});

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({
        _id: req.params.id
    }).lean().then((categoria) => {
        res.render('./admin/editCategorias', {
            categoria: categoria
        });
    }).catch((e) => {
        req.flash("error_msg", "Esta categoria não existe!");
        res.redirect("/categorias");
    });
});

router.post("/categorias/edit", (req, res) => {
    Categoria.findOne({
        _id: req.body.id
    }).then((categoria) => {
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;
        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!");
            res.redirect('/categorias');
        }).catch((e) => {
            req.flash('error_msg', "Ocorreu um erro interno ao salvar a edição da categoria.");
            res.redirect('/categorias');

        });
    }).catch((e) => {
        req.flash('error_msg', "Houve um erro ao editar a categoria.");
        res.redirect("/categorias");
    });
});

router.post("/categorias/delete", (req, res) => {
    Categoria.deleteOne({
        _id: req.body.id
    }).lean().then(() => {
        req.flash("success_msg", "Categoria apagada.");
        res.redirect("/categorias");
    }).catch((e) => {
        req.flash("error_msg", "Ocorreu um erro ao apagar a categoria.");
        res.redirect("/categorias");
    });
});

router.get('/posts', (req, res) => {
    Post.find().populate("categoria").sort({
        data: "desc"
    }).lean().then((posts) => {
        res.render('admin/posts', {
            posts: posts
        });
    }).catch((e) => {
        req.flash('error_msg', "Ocorreu um erro ao listar as postagens.");
        res.redirect("/posts");
    });
});

router.get('/posts/add', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addPost', {
            categorias: categorias
        });
    }).catch((e) => {
        req.flash('error_msg', "Ocorreu um erro ao gerar o formulário.");
        res.redirect('/');
    });
});

router.post("/posts/novo", (req, res) => {
    var erros = [];
    if (req.body.categoria == "0") {
        erros.push({
            text: "Categoria inválida, registe uma categoria"
        });
    }

    if (erros.length > 0) {
        res.render("/admin/addPost", {
            erros: erros
        });
    } else {
        const novoPost = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Post(novoPost).save().then(() => {
            req.flash("success_msg", "Post criado com sucesso!");
            res.redirect("/posts");
        }).catch((e) => {
            req.flash('error_msg', 'Ocorreu um erro ao guardar o post!');
            res.redirect('/posts');
        });
    }
});

router.get('/posts/edit/:id', (req, res) => {
    Post.findOne({
        _id: req.params.id
    }).lean().then((post) => {
        Categoria.find().lean().then((categorias) => {
            res.render("./admin/editPosts", {
                categorias: categorias,
                post: post
            });
        }).catch((e) => {
            req.flash("error_msg", "Ocorreu um erro ao listar as categorias.");
            res.redirect("/posts");
        });
    }).catch((e) => {
        req.flash("erro_msg", "Ocorreu um erro ao carregar o formulário de edição.");
        res.redirect("/posts");
    });
});

router.post("/posts/edit", (req, res) => {
    Post.findOne({
        _id: req.body.id
    }).then((post) => {
        post.titulo = req.body.titulo;
        post.slug = req.body.slug;
        post.descricao = req.body.descricao;
        post.conteudo = req.body.conteudo;
        post.categoria = req.body.categoria;
        post.save().then(() => {
            req.flash("success_msg", "Post editado com sucesso!");
            res.redirect('/posts');
        }).catch((e => {
            req.flash('error_msg', 'Ocorreu um erro ao salvar a edição do post');
            res.redirect("/posts");
        }));
    }).catch((e) => {
        req.flash("error_msg", "Ocorreu um erro ao guardar a edição" + e);
        res.redirect("/posts");
    });
});

router.get("/posts/apagar/:id", (req, res) => {
    Post.remove({
        _id: req.params.id
    }).then(() => {
        req.flash("success_msg", "Post apagado com sucesso.");
        res.redirect("/posts");
    }).catch((e) => {
        req.flash("error_msg", "Não foi possível apagar o post: " + e);
        res.redirect('/posts');
    });
});

module.exports = router;