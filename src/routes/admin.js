const express = require("express");
const admin = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const mongoose = require("mongoose");

const RegistroMonster = require("../model/monster")

function isLogged(req,res,next){
    if(!req.user){
        req.flash("error","Você precisa estar logado para entrar aqui")
        res.redirect("/")
    }else{
        next()
    }
}

admin.get("/painelDeControle", isLogged, (req,res)=>{
    res.render("admin/senha", {user:req.user, errorMessages: req.flash('error')}) 

})

admin.post("/painelDeControle", isLogged, (req, res) => {
    const { password1, password2, password3, password4, password5, password6 } = req.body;

    if (password1 == "1" && password2 == "a" && password3 == "2" && password4 == "b" && password5 == "3" && password6 == "c") {
        // Definindo uma variável de sessão
        req.session.isAuthenticated = true;
        res.redirect("/admin/produtosPainel");
    } else {
        req.flash("error", "Senha incorreta!");
        res.redirect("/admin/painelDeControle");
    }
});


function checkAuthentication(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        req.flash("error", "Você precisa colocar a senha para acessar esta página.");
        res.redirect("/admin/painelDeControle");
    }
}

admin.get("/produtosPainel", checkAuthentication, isLogged, (req, res) => {
    res.render("admin/produtosPainel", { user: req.user });
});

admin.get("/addProdutos", checkAuthentication, isLogged, (req, res) => {
    res.render("admin/addProdutos", { user: req.user,
        errorMessages: req.flash('error'), 
        successMessages: req.flash('success') });
});

admin.post("/addProdutos", checkAuthentication, upload.single('imagem'), isLogged, async (req, res) => {

    const {nome, preco, desconto, descricao} = req.body

    const imagem = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      } 

    const DescricaoProdutos = new RegistroMonster ({
        nome,
        preco,
        desconto,
        descricao,
        imagem
    })

    try {

        await DescricaoProdutos.save()
        req.flash("success", "Produto cadastrado com sucesso!")
        res.redirect("/admin/addProdutos")
    } catch (error) {
        req.flash("error", "O produto não foi cadastrado, tente novamente!")
        res.redirect("/admin/addProdutos")
    }

});

admin.get("/deletProdutos", checkAuthentication, isLogged, (req, res) => {
    RegistroMonster.find()
    .then((produtos) => {
        if (produtos) {
            // Convertendo cada produto para incluir a imagem em Base64
            const produtosComImagemBase64 = produtos.map(produto => {
                // Verifica se o produto tem uma imagem antes de tentar converter
                if (produto.imagem && produto.imagem.data && produto.imagem.contentType) {
                    const imagemBase64 = produto.imagem.data.toString('base64');
                    return {
                        ...produto.toObject(), // Converte o documento Mongoose para um objeto JavaScript, se necessário
                        imagemBase64: `data:${produto.imagem.contentType};base64,${imagemBase64}` // Adiciona a imagem em Base64 ao objeto do produto
                    };
                } else {
                    return produto.toObject(); // Retorna o produto sem modificação se não houver imagem
                }
            });
            
            res.render("admin/deletProdutos", { user: req.user, produtos: produtosComImagemBase64,
                errorMessages: req.flash('error'), 
                successMessages: req.flash('success') 
            });
        } else {
            res.redirect("/admin/produtosPainel")
        }
    })
    .catch((error) => {
        req.flash("error", "Algo deu errado, tente novamente!")
        res.redirect("/admin/produtosPainel");
    });
});

admin.get('/deletProdutos/:id', isLogged, async (req, res) => {

    let id = req.params.id;

    // Substituindo os dois pontos por uma string vazia
    let idModificada = id.replace(":", "");

    try {
      const produtoDeletado = await RegistroMonster.findByIdAndDelete({_id : idModificada });
      if (!produtoDeletado) {
        return res.redirect("/admin/deletProdutos")
      }
      req.flash("success", "Produto deletado com sucesso!")
      res.redirect("/admin/deletProdutos")
    } catch (error) {
        res.redirect("/admin/deletProdutos")
    }
  });

admin.get("/editProdutos", checkAuthentication, isLogged, (req, res) => {
    
    RegistroMonster.find()
    .then((produtos) => {
        if (produtos) {
            // Convertendo cada produto para incluir a imagem em Base64
            const produtosComImagemBase64 = produtos.map(produto => {
                // Verifica se o produto tem uma imagem antes de tentar converter
                if (produto.imagem && produto.imagem.data && produto.imagem.contentType) {
                    const imagemBase64 = produto.imagem.data.toString('base64');
                    return {
                        ...produto.toObject(), // Converte o documento Mongoose para um objeto JavaScript, se necessário
                        imagemBase64: `data:${produto.imagem.contentType};base64,${imagemBase64}` // Adiciona a imagem em Base64 ao objeto do produto
                    };
                } else {
                    return produto.toObject(); // Retorna o produto sem modificação se não houver imagem
                }
            });
            
            res.render("admin/editProdutos", { user: req.user, produtos: produtosComImagemBase64,
                errorMessages: req.flash('error'), 
                successMessages: req.flash('success')
            });
        } else {
            res.redirect("/admin/produtosPainel")
        }
    })
    .catch((error) => {
        req.flash("error", "Algo deu errado, tente novamente!")
        res.redirect("/admin/produtosPainel");
    });
    
    
});

admin.get("/editProdutos/:id", checkAuthentication, isLogged, async(req, res) => {

    const id = req.params.id
    const idModificado = id.replace(":","")

    await RegistroMonster.findById({_id:idModificado})
    .then((produto)=>{
        if(produto){
            res.render("admin/alterarProdutos", {user:req.user, produtos: produto})
        }else{
            req.flash("error", "Algo deu errado, tente novamente!")
            res.redirect("/admin/editProdutos")
        }
    })

})

admin.post("/editProdutos/:id", checkAuthentication, isLogged, upload.single('imagem'), async(req, res) => {

        const id = req.params.id
        const idModificado = id.replace(":","")
    
        const {nome, preco, desconto, descricao} = req.body
    
        const imagem = {
            data: req.file.buffer,
            contentType: req.file.mimetype
          } 
    
        try {
            // Atualização do usuário
            await RegistroMonster.findOneAndUpdate(
                { _id: idModificado }, // Critério de busca pelo ID
                {
                    nome,
                    preco,
                    desconto,
                    descricao,
                    imagem
                },
                { new: false } // Esta opção `new: false` é o padrão e retorna o documento original. Se você quiser o documento atualizado, use `new: true`.
            );
    
            req.flash("success", "Produto atualizado com sucesso!");
            res.redirect("/admin/editProdutos");
        } catch (error) {
            console.log(error)
            req.flash("error", "Algo deu errado, tente novamente")
            res.redirect("/admin/editProdutos");
        }
    


})

///Rota para erro
admin.use(function(req,res,next){
    res.status(404).send("Esta rota não existe")
});


module.exports = admin;