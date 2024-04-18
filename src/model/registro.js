const mongoose = require("mongoose")

const RegistroUser = mongoose.model("RegistroUser", ({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    produtoId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produto'
    }],
    
    endereco: {
        estado: {
            type: String
        },
        cidade: {
            type: String
        },
        rua: {
            type: String
        },
        complemento: {
            type: String
        },
        numero: {
            type: String
        },
        telefone: {
            type: String
        },
        quantidadeDeProdutos: [{
            nomeProduto: String,
            quantidade: Number
        }]
        
    }

}))

module.exports = RegistroUser;