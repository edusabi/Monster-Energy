const mongoose = require("mongoose")

const RegistroMonster = (mongoose.model("monster", ({
    nome:{
        type: String,
        required: true
    },
    
    preco:{
        type: String,
        required: true
    },
    
    desconto:{
        type: String
    },

    descricao:{
        type: String,
        required: true
    },

    imagem: { 
        data: Buffer, 
        contentType: String
     }

})));

module.exports = RegistroMonster;