const express = require("express");
const app = express();
const path = require("path");
const users = require("./routes/users");
const admin = require("./routes/admin");
const mongoose = require("mongoose");
const session = require("express-session")
const bodyParser = require("body-parser")
const flash = require("connect-flash");
const passport = require("passport");

const DB_PASS = process.env.DB_PASS

const DB_NAME = process.env.DB_NAME

const DB_LINK = `mongodb+srv://${DB_NAME}:${DB_PASS}@monsterenergy.dsrfpkp.mongodb.net/MonsterEnergy?retryWrites=true&w=majority&appName=monsterEnergy`

mongoose.connect(DB_LINK)
.then(()=>{
    console.log("Mongo rodando")
})
.catch((error)=>{
    console.log(error + "Deu erro no mongo")
})

const RegistroMonster = require("./model/monster")

const Registro = require("./model/registro")

//Session
app.use(session({
    secret: "Random secret key",
    cookie: {
        maxAge:6000 * 26 * 24
    },
    saveUninitialized:true,
    resave:true
}))

/////Passport
app.use(passport.initialize())
app.use(passport.session())

/////////////Flash
app.use(flash())

///////Body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

///Outras Rotas
app.use("/users", users)
app.use("/admin", admin)

/////Public
app.use(express.static(path.join(__dirname, "public")));

///Midlewares
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

function isLogged(req,res,next){
    if(!req.user){
        req.flash("error","Você precisa estar logado para entrar aqui")
        res.redirect("/")
    }else{
        next()
    }
}

/////Rotas
app.get("/",(req,res)=>{
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
            
            res.render("index", { user: req.user, produtos: produtosComImagemBase64,
                errorMessages: req.flash('error'), 
                successMessages: req.flash('success') 
            });
        } else {
            res.redirect("/")
        }
    })
    .catch((error) => {
        req.flash("error", "Algo deu errado, tente novamente!")
        res.redirect("/");
    });

});




app.get('/buscarProduto/:id', async (req, res) => {
    const idDoProduto = req.params.id;
    const usuarioId = req.user._id; // Supondo que você tenha o ID do usuário

    try {
        // Verifica se há um usuário conectado
        if (!usuarioId) {
            throw new Error('Nenhum usuário conectado.');
        }

        // Encontra ou cria o registro do usuário
        let registro = await Registro.findOne({ _id: usuarioId });

        // Se o registro não existir, cria um novo com produtoId como um array vazio
        if (!registro) {
            registro = new Registro({ _id: usuarioId, produtoId: [] });
        }

        // Transforma produtoId em um array, se necessário
        if (!Array.isArray(registro.produtoId)) {
            registro.produtoId = [registro.produtoId];
        }

        // Verifica se o ID do produto já existe no array de produtos do registro do usuário
        if (!registro.produtoId.includes(idDoProduto)) {
            // Adiciona o ID do produto ao array de produtos do registro do usuário
            registro.produtoId.push(idDoProduto);

            // Salva o registro do usuário com o novo ID do produto
            await registro.save();

            req.flash("Produto adicionado ao carrinho")
            req.redirect("/")
        } else {
            req.flash("error", "O produto já está adicionado ao carrinho")
            req.redirect("/")
        }
        res.redirect("/");
    } catch (error) {
        req.flash("error", "Algo deu errado, tente novamente!");
        res.redirect("/");
    }
});

app.get("/meuCarrinho/:id", isLogged ,async (req,res)=>{

    const ID = req.params.id;
    const IdModificado = ID.replace(":", "");
    
    try {
        // Encontra o usuário pelo ID modificado
        const usuario = await Registro.findById(IdModificado);
        
        // Se o usuário não for encontrado, redireciona para a página inicial
        if (!usuario) {
            req.flash("error", "Usuário não encontrado");
            return res.redirect("/");
        }
    
        // Verifica se usuario.produtoId é um array e não está vazio
        if (!Array.isArray(usuario.produtoId) || usuario.produtoId.length === 0) {
            req.flash("error", "Nenhum produto encontrado!");
            return res.redirect("/");
        }
        
        // Busca os produtos associados ao usuário
        const produtos = await RegistroMonster.find({ _id: { $in: usuario.produtoId } });
        
        // Verifica se há produtos encontrados
        if (produtos.length > 0) {
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
    
            // Renderiza a página com os produtos encontrados
            return res.render("compra/carrinho", { 
                user: req.user,
                produtos: produtosComImagemBase64,
                errorMessages: req.flash('error'), 
                successMessages: req.flash('success') 
            });
        } else {
            // Se não houver produtos encontrados, redireciona para a página inicial
            req.flash("error", "Nenhum produto encontrado para este!");
            return res.redirect("/");
        }
    } catch (error) {
        // Lida com erros durante a busca de usuário ou produtos
        console.error("Erro:", error);
        req.flash("error", "Erro ao buscar usuário ou produtos");
        return res.redirect("/");
    }

})

app.get("/deletPcarrinho/:id", isLogged,async(req,res)=>{

    const user = req.user._id;

    try {
        // Encontra o usuário pelo ID
        const usuario = await Registro.findOne({ _id: user });
    
        if (!usuario) {
            return res.status(404).send("Usuário não encontrado");
        }
    
        const idProdutoModificado = req.params.id;
        const idProduto = idProdutoModificado.replace(":", "");
    
        // Remove o item específico da lista de produtos do usuário
        await Registro.findOneAndUpdate(
            { _id: user },
            { $pull: { produtoId: idProduto } }
        );
    
        return res.redirect(`/meuCarrinho/:${user}`)
    } catch (error) {
        console.error("Erro ao excluir item do usuário:", error);
        return res.status(500).send("Erro ao excluir item do usuário");
    }
    

})


app.get("/seuEndereco", isLogged, async(req,res)=>{
    
    const user = req.user._id;
    
    try {
        // Encontra o usuário pelo ID
        const usuario = await Registro.findById(user);
        
        if (!usuario) {
            return res.status(404).send("Usuário não encontrado");
        }
        
        // Aqui você pode acessar os itens específicos que estão dentro do usuário
        // Por exemplo, se houver um campo chamado "itens", você pode acessá-lo assim:
        const itens = usuario.produtoId;
        
        RegistroMonster.find({_id:itens})
        .then((produtos)=>{
            
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
                
                res.render("compra/endereco", { user: req.user,
                     produtos: produtosComImagemBase64,
                    errorMessages: req.flash('error'), 
                    successMessages: req.flash('success') 
                });
            }
        })
        
        
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return res.status(500).send("Erro ao buscar usuário");
    }
    
})    

app.post("/seuEndereco", isLogged, async (req, res) => {
    const user = req.user._id;

    try {
        let registro = await Registro.findOne({ _id: user });

        if (!registro) {
            req.flash("error", "Algo deu errado, tente novamente!");
            return res.redirect("/");
        }

        const { cidade, estado, rua, numero, telefone, complemento, nomeProduto, quantidade } = req.body;

        // Verifica se `nomeProduto` e `quantidade` são arrays
        if (Array.isArray(nomeProduto) && Array.isArray(quantidade)) {
            // Se ambos forem arrays e tiverem o mesmo comprimento, cria um array de objetos de produto
            if (nomeProduto.length === quantidade.length) {
                const produtos = [];
        
                for (let i = 0; i < nomeProduto.length; i++) {
                    const produto = {
                        nomeProduto: nomeProduto[i],
                        quantidade: parseInt(quantidade[i])
                    };
                    produtos.push(produto);
                }
        
                // Atualiza o documento existente com as informações de endereço e quantidade do req.body
                registro.endereco = {
                    cidade,
                    estado,
                    rua,
                    numero,
                    telefone,
                    complemento,
                    quantidadeDeProdutos: produtos
                };
        
                await registro.save();
            } else {
                // Se os arrays `nomeProduto` e `quantidade` têm comprimentos diferentes, retorna um erro
                console.error("Quantidades de produtos e quantidades não correspondem.");
            }
        } else {
            // Se `nomeProduto` ou `quantidade` não forem arrays, trata como a compra de um único produto
            const produto = {
                nomeProduto,
                quantidade: parseInt(quantidade)
            };
        
            // Atualiza o documento existente com as informações de endereço e quantidade do req.body
            registro.endereco = {
                cidade,
                estado,
                rua,
                numero,
                telefone,
                complemento,
                quantidadeDeProdutos: [produto] // Adiciona o objeto do produto ao array
            };
        
            await registro.save();
        }
        

        
        // Redireciona ou envia uma resposta de sucesso
        req.flash("success", "Endereço adicionado com sucesso!")
        res.redirect("/comprar")
    } catch (error) {
        console.error("Erro ao atualizar endereço:", error);
        req.flash("error", "Erro ao atualizar endereço, tente novamente!");
        res.redirect("/");
    }
});

///Rota para erro
app.use(function(req,res,next){
    res.status(404).send("Esta rota não existe")
});



app.listen("8080", ()=>{console.log("Servidor Monster rodando!")});