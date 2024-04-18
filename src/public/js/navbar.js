const navbar = document.querySelector(".navbar")

const itens = document.querySelector(".itens")

const body = document.querySelector("body")


navbar.addEventListener("click", ()=>{

    itens.classList.toggle("ativo")

    if(itens.classList.contains("ativo")){
        body.style.overflowY = "hidden"
        
        document.querySelector('.line2').style.rotate = '135deg';
        document.querySelector('.line2').style.position = 'absolute';
        document.querySelector('.line3').style.top = '1rem';
        document.querySelector('.line3').style.rotate = '-135deg';

        document.querySelector('.line1').style.display = 'none';
    } else {
          document.querySelector('.line2').style.rotate = '0deg';
          document.querySelector('.line3').style.rotate = '0deg';
          document.querySelector('.line3').style.top = '0';
          document.querySelector('.line2').style = '';   
          
          document.querySelector('.line1').style.display = 'block';
        
          body.style.overflowY = "auto"
        
    }
    

})