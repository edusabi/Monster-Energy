document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="password"]');

    inputs.forEach((input, index) => {
        // Detecta entrada para mover o foco para frente
        input.addEventListener('input', () => {
            // Se um caractere for digitado e não for o último input, move o foco para frente
            if (input.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
        // Se a tecla Backspace for pressionada
        if (e.key === "Backspace") {
            // Se o input atual estiver vazio e não for o primeiro input, move o foco para trás
            if (input.value.length === 0 && index > 0) {
                e.preventDefault(); // Previne o comportamento padrão do backspace
                inputs[index - 1].value = ''; // Limpa o input anterior antes de mover o foco
                inputs[index - 1].focus();
            }
        }
    });
});
});


document.getElementById('inputFoto').addEventListener('change', function() {
    const preview = document.getElementById('preview');
    const file = this.files[0];
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = function(e) {
        preview.innerHTML = '<img src="' + e.target.result + '" alt="Foto" style="max-width: 200px; max-height: 200px;">';
      };
  
      reader.readAsDataURL(file);
    }
  });
  
//   document.getElementById('formUploadFoto').addEventListener('submit', function(e) {
//     e.preventDefault(); // Impede o envio tradicional do formulário
  
//     const file = document.getElementById('inputFoto').files[0];
//     if (file) {
//       // Aqui você pode adicionar o código para enviar a foto para o servidor
//       // Por exemplo, usando FormData e fetch para um endpoint de API
//       const formData = new FormData();
//       formData.append('foto', file);
  
//       fetch('/caminho/para/servidor', {
//         method: 'POST',
//         body: formData,
//       })
//       .then(response => response.json())
//       .then(data => console.log(data))
//       .catch(error => console.error('Erro:', error));
//     }
//   });
  
