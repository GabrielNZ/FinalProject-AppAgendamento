var paragrafoNotificador = document.getElementById('paragrafoNotificador')
async function realizarlogin(){
    var email = document.getElementById('email').value
    var senha = document.getElementById('password').value
    if (!email || !senha) {
        paragrafoNotificador.textContent = "Preencha email e senha!"
        paragrafoNotificador.style.color = "#d63232ff"
    return
    }
    var dadosLogin = {
        email: email,
        senha: senha
    }
    try{
        const response = await fetch('http://localhost:8765/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosLogin)
        });
        if (!response.ok) {
            const erroTexto = await response.text()
            paragrafoNotificador.textContent = (erroTexto || response.status)
            paragrafoNotificador.style.color = "#d63232ff"
            return
        }
        const responseBody = await response.text()
        const token = response.headers.get("Authorization");
        paragrafoNotificador.textContent = 'Usuario logado com sucesso.'
        paragrafoNotificador.style.color = "#32d65e"
        
        if(responseBody == 'PRESTADOR') {
            localStorage.setItem('token_prestador', token)
            window.location.href = 'dashboardprestador.html'
        }else {
             localStorage.setItem('token_usuario', token)
            window.location.href = 'dashboard.html'; 
        }
    } catch(error){
        console.error("Houve um problema com a requisição:", error)
        paragrafoNotificador.textContent = ("Houve um problema com a requisição:", error)
    }
}
async function realizarRegistro() {
    var nome = document.getElementById('nome').value
    var email = document.getElementById('email').value
    var senha = document.getElementById('password').value
    var tipo = document.querySelector('input[name="tipo"]:checked')
    if (tipo === null){
        paragrafoNotificador.textContent = "Selecione o tipo da conta."
        paragrafoNotificador.style.color = "#d63232ff"
        return
    }
    if (!email || !senha) {
        paragrafoNotificador.textContent = "Preencha email e senha!"
        paragrafoNotificador.style.color = "#d63232ff"
        return
    }
    if (nome === "") {
        paragrafoNotificador.textContent = "Preencha o nome de usuário."
        paragrafoNotificador.style.color = "#d63232ff"
        return
    }
    var dadosRegistro = {
        nome: nome,
        email: email,
        senha: senha,
        tipo: tipo.value
    }
    try{
        const response = await fetch('http://localhost:8765/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosRegistro)
        });
            if (!response.ok) {
            const erroTexto = await response.text()
            paragrafoNotificador.textContent = (erroTexto || response.status)
            paragrafoNotificador.style.color = "#d63232ff"
            return
        }
        const token = response.headers.get("Authorization");

        paragrafoNotificador.textContent = await response.text()
        paragrafoNotificador.style.color = "#32d65e"

        if(tipo === 'PRESTADOR') {
            localStorage.setItem('token_prestador', token)
            window.location.href = 'dashboardprestador.html'
        }else {
             localStorage.setItem('token_usuario', token)
            window.location.href = 'dashboard.html'; 
        }
        window.location.href = 'dashboard.html';
    } catch(error){
        paragrafoNotificador.textContent = "Erro de conexão. Tente novamente "
        paragrafoNotificador.style.color = "#d63232ff"
        console.error("Houve um problema com a requisição:", error)
    }
}