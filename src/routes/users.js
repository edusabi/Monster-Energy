const express = require("express"); // Corrigido para incluir o express corretamente
const users = express.Router();
const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");

const passport = require("passport")
require("../config/Auth")(passport)

const nodemailer = require("nodemailer")


const RegistroUser = require("../model/registro");

function isLogged(req,res,next){
    if(!req.user){
        req.flash("error","Você precisa estar logado para entrar aqui")
        res.redirect("/")
    }else{
        next()
    }
}

users.get("/perfil", (req, res) => {
    res.render("loginRegistro/perfil", {user:req.user,
        errorMessages: req.flash('error'), 
        successMessages: req.flash('success') });
});

users.get("/registro", (req, res) => {
    // Modificado para passar mensagens de erro e sucesso separadamente
    res.render("loginRegistro/registro", {
        errorMessages: req.flash('error'), // Passando mensagens de erro
        successMessages: req.flash('success') // Passando mensagens de sucesso (caso necessário)
    });
});

users.post("/registro", async (req, res) => {

    var erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome === null || req.body.nome.length < 4) {
        erros.push("Nome inválido!");
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email === null) {
        erros.push("Email inválido!");
    }

    if (!req.body.password || typeof req.body.password == undefined || req.body.password === null) {
        erros.push("Senha inválida!");
    }

    if (req.body.password.length < 4) {
        erros.push("Senha muito curta!");
    }

    if (req.body.password != req.body.confirmPassword) {
        erros.push("As senhas são diferentes, tente novamente!");
    }


    if (erros.length > 0) {
        // Utilizando loop para adicionar cada erro ao flash
        erros.forEach(erro => req.flash('error', erro));
        res.redirect('/users/registro'); // Redirecionando de volta à página de registro
    } else {

        await RegistroUser.findOne({email: req.body.email})
        .then(async(user)=>{
            if(user){
                req.flash("error","Usuário já cadastrado ou inválido!");
                res.redirect("/users/registro")
            }else{
                const { nome, email, password } = req.body; // confirmPassword não é necessário guardar

        const salt = await bcryptjs.genSalt(12);
        const passwordHash = await bcryptjs.hash(password, salt);


        const User = new RegistroUser({
            nome,
            email,
            password: passwordHash
        });

        try {
            await User.save();
            req.flash("success", "Usuário criado com sucesso!");
            res.redirect("/users/login");
        } catch (error) {
            console.log(error, "Deu erro");
            erros.push("Erro ao criar usuário.");
            erros.forEach(erro => req.flash('error', erro));
            res.redirect("/users/registro");
        }
            }
        });

        
    }
});

users.get("/login", (req, res) => {
    res.render("loginRegistro/login", {
        errorMessages: req.flash('error'),
        successMessages: req.flash('success')
    });
});

// Rota POST para o login
users.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
    successFlash: 'Bem-vindo!' // Adiciona uma mensagem de sucesso ao Flash
}));

// Rota de Logout
users.get('/logout', (req, res) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', 'Logout efetuado com sucesso.');
      res.redirect('/');
    });
  });


  
users.get("/alterarDados", isLogged,(req, res) => {
    res.render("loginRegistro/alterarDados", {user: req.user});
});
  
users.post("/alterarDados", async (req, res) => {
    var erros = [];

    // Validações básicas
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome === null || req.body.nome.length < 4) {
        erros.push("Nome inválido!");
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email === null) {
        erros.push("Email inválido!");
    }

    if (erros.length > 0) {
        erros.forEach(erro => req.flash('error', erro));
        res.redirect('/users/registro');
    } else {
        const { nome, email, txtId } = req.body;

        try {
            // Atualização do usuário
            await RegistroUser.findOneAndUpdate(
                { _id: txtId }, // Critério de busca pelo ID
                {
                    nome,
                    email // Presumo que você também deseja atualizar o e-mail; ajuste conforme necessário
                },
                { new: false } // Esta opção `new: false` é o padrão e retorna o documento original. Se você quiser o documento atualizado, use `new: true`.
            );

            req.flash("success", "Usuário atualizado com sucesso!");
            res.redirect("/users/perfil");
        } catch (error) {
            erros.push("Erro ao atualizar usuário.");
            erros.forEach(erro => req.flash('error', erro));
            res.redirect("/users/perfil");
        }
    }
});

users.get("/atlSenha", (req,res)=>{
    res.render("loginRegistro/atlSenha", {user: req.user,
        errorMessages: req.flash('error'), 
    })
})

users.post("/atlSenha", async (req,res)=>{
    
    var erros = [];

    if (!req.body.email || typeof req.body.email == undefined || req.body.email === null) {
        erros.push("Email inválido!");
    }

    if (erros.length > 0) {
        erros.forEach(erro => req.flash('error', erro));
        res.redirect('/users/atlSenha');
    } else {
        const { email } = req.body;

        try {
            // Atualização do usuário
            await RegistroUser.findOne({email : email})
            .then((user)=>{
                if(user){
                    const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                    user: "luiseduardodevv@gmail.com",
                    pass: "dlap ywbp yrct awfu",
                    },
                });

                transporter.sendMail({
                    from:"Luís Eduardo Devv <luiseduardodevv@gmail.com>",
                    to: email,
                    subject: "Olá, sou o admin deste site. Você pediu para redefinir sua senha? Aqui está o link para redefini-la:",
                    html: req.protocol+'://'+req.hostname+'/users/changeSenha/:' + user._id + ' Clique no link acima para redefinir!'
                })
                .then((message)=>{
                    
                }).catch((err)=>{
                    console.log(err + " " + "Deu erro")
                })
                }
            });
            res.redirect("/users/login");
        } catch (error) {
            erros.push("Erro ao atualizar usuário.");
            erros.forEach(erro => req.flash('error', erro));
            res.redirect("/users/login");
        }
    }

})

users.get("/changeSenha/:id", (req,res)=>{
    res.render("loginRegistro/changeSenha", {user:req.user})

})

users.post("/changeSenha/:id", async (req, res) => {
    let str = "65f79077:bf5bd2aa:2083b447";
    let novaStr = str.replace(/:/g, ""); 

    var erros = [];

    if (!req.body.password || typeof req.body.password == undefined || req.body.password === null) {
        erros.push("Senha inválida!");
    } else if (req.body.password.length < 4) {
        erros.push("Senha muito curta!");
    } else if (req.body.password != req.body.confirmPassword) {
        erros.push("As senhas são diferentes, tente novamente!");
    }

    if (erros.length > 0) {
        erros.forEach(erro => req.flash('error', erro));
        res.redirect('/users/login'); 
    } else {
        const { password } = req.body;

        try {
            const salt = await bcryptjs.genSalt(12);
            const passwordHash = await bcryptjs.hash(password, salt);

            await RegistroUser.findByIdAndUpdate({ _id: novaStr }, { password: passwordHash });

            req.flash("success", "Senha atualizada com sucesso!");
            res.redirect("/users/login");
        } catch (error) {
            console.error("Erro ao atualizar senha:", error);
            req.flash('error', "Erro ao atualizar senha.");
            res.redirect('/users/login');
        }
    }
});

///Rota para erro
users.use(function(req,res,next){
    res.status(404).send("Esta rota não existe")
});


module.exports = users;
