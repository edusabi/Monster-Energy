///////Estados e Cidades
const urlEstados = "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
const cidades = document.getElementById("cidade")
const estados = document.getElementById("estado")

estados.addEventListener("change", async ()=>{
  const urlCidades = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/"+ estados.value +"/distritos"

  const request = await fetch(urlCidades)

  const response = await request.json()

  let array = response;

  const urlCidades2 = array.sort((a, b) => a.nome.localeCompare(b.nome));


  let options = ""
  urlCidades2.forEach(function(cidades){
    options += "<option>"+cidades.nome+"</option>"
  })

  cidades.innerHTML = options
  
})

window.addEventListener("load", async ()=>{
  const request = await fetch(urlEstados)
  
  const response = await request.json()

  let array = response;

  const urlEstados2 = array.sort((a, b) => a.nome.localeCompare(b.nome));

  const options = document.createElement("optgroup")
  options.setAttribute("label", "Estados")

  urlEstados2.forEach(function(estado){
    options.innerHTML += `<option>${estado.sigla}</option>`
  }) 

  estados.append(options)
})  
