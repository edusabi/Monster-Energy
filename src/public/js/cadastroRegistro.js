const olhosAbrt1 = document.getElementById("olhosAbrt1")
const olhosAbrt2 = document.getElementById("olhosAbrt2")

const inputSenha = document.getElementById("senha")
const inputConfirmSenha = document.getElementById("confirmSenha")


olhosAbrt1.addEventListener("click", ()=>{

    olhosAbrt1.classList.toggle("ativo")
    if(olhosAbrt1.classList.contains("ativo")){     
        olhosAbrt1.setAttribute("name", "eye-off-outline")

        if(inputSenha.type === "password"){
            inputSenha.type = "text"
            olhosAbrt1.style.color= "rgb(0, 255, 0)"
        }
        
    }else{
        olhosAbrt1.setAttribute("name", "eye-outline")
        
        if(inputSenha.type === "text"){
            inputSenha.type = "password"
            olhosAbrt1.style.color= "#fff"
        }
    }

})

olhosAbrt2.addEventListener("click", ()=>{


    olhosAbrt2.classList.toggle("ativo")
    if(olhosAbrt2.classList.contains("ativo")){
        olhosAbrt2.setAttribute("name", "eye-off-outline")

        if(inputConfirmSenha.type === "password"){
            inputConfirmSenha.type = "text"
            olhosAbrt2.style.color= "rgb(0, 255, 0)"
        }
    }else{
        olhosAbrt2.setAttribute("name", "eye-outline")
        
        if(inputConfirmSenha.type === "text"){
            inputConfirmSenha.type = "password"
            olhosAbrt2.style.color= "#fff"
        }
    }

})