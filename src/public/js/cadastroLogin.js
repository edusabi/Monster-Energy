const olhosAbrt3 = document.getElementById("olhosAbrt3")
const inputSenhaLogin = document.getElementById("inputSenhaLogin")

olhosAbrt3.addEventListener("click", ()=>{

    olhosAbrt3.classList.toggle("ativo")
    if(olhosAbrt3.classList.contains("ativo")){
        olhosAbrt3.setAttribute("name", "eye-off-outline")

        if(inputSenhaLogin.type === "password"){
            inputSenhaLogin.type = "text"
            olhosAbrt3.style.color= "rgb(0, 255, 0)"
        }
    }else{
        olhosAbrt3.setAttribute("name", "eye-outline")
        
        if(inputSenhaLogin.type === "text"){
            inputSenhaLogin.type = "password"
            olhosAbrt3.style.color= "#fff"
        }
    }

})