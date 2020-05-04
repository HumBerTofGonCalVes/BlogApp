// jshint esversion: 6

//Carregar módulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const session = require("express-session");
const flash = require('connect-flash');
require("./models/Posts");
const Post = mongoose.model("posts");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
const usuarios = require("./routes/usuario");
const passport = require("passport");
require("./config/auth")(passport);
const db= require("./config/db");

//Configurações
//Sessões
app.use(session({
    secret: 'qualquerCoisa',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});
//Body-Parser
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
//Handlebars
app.engine('handlebars', handlebars({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
//MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log('Conectado ao Mongo');
}).catch((e) => {
    console.log('Aconteceu um erro na conexão á BD: ' + e);
});
//Public
app.use(express.static(path.join(__dirname, 'public')));

//Rotas
app.use("/", admin);

app.use('/home', (req, res) => {
    Post.find().populate("categoria").sort({
        data: "desc"
    }).lean().then((posts) => {
        res.render('index', {
            posts: posts
        });
    }).catch((e) => {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/404");
    });
});

app.get("/post/:slug", (req, res) => {
    Post.findOne({
        slug: req.params.slug
    }).lean().then((post) => {
        if (post) {
            req.flash("success_msg", "Está na página do post!");
            res.render('post/index', {
                post: post
            });
        } else {
            req.flash("error_msg", "Este post não existe.");
            res.redirect("/home");
        }
    }).catch((e) => {
        req.flash("error_msg", "Ocorreu um erro interno.");
        res.redirect("/home");
    });
});

app.get("/listaCategorias", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("./categorias/index", {
            categorias: categorias
        });
    }).catch((e) => {
        req.flash("error_msg", "Ocorreu um erro ao listar as categorias");
        res.redirect("/home");
    });
});

app.get("/listaCategorias/:slug", (req, res) => {
    Categoria.findOne({
        slug: req.params.slug
    }).lean().then((categoria) => {
        if (categoria) {
            Post.find({
                categoria: categoria._id
            }).lean().then((posts) => {
                res.render("./categorias/posts", {
                    posts: posts,
                    categoria: categoria
                });
            }).catch((e) => {
                req.flash("error_msg", "Ocorreu um erro ao listar os posts.");
                res.redirect("/home");
            });
        } else {
            req.flash("error_msg", "Esta categoria não existe.");
            res.redirect("/home");
        }
    }).catch((e => {
        req.flash("error_msg", "Ocorreu um erro interno ao carregar a página desta categoria");
        res.redirect("/home");
    }));
});

app.get("/404", (req, res) => {
    res.send("Erro 404!");
});

app.use("/usuarios", usuarios);

//Outros
//Servidor
const Port = process.env.PORT || 8081;
app.listen(Port, () => console.log('Servidor a trabalhar...'));