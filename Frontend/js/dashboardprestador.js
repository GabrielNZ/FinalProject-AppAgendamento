const token = localStorage.getItem('token_prestador')
const tituloInfo = document.getElementById('usuario-infos')
var abaServico = false
var abaAgendamento = false
const mapaDias = {
    1: `SEGUNDA`,
    2: `TERCA`,
    3: `QUARTA`,
    4: `QUINTA`,
    5: `SEXTA`
};
const mapaSemana = {
    SEGUNDA: `Segunda`,
    TERCA: `Terça`,
    QUARTA: `Quarta`,
    QUINTA: `Quinta`,
    SEXTA: `Sexta`
};
const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const mesesNumero = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12"
];

if(token === null || token === "") {
    tituloInfo.textContent = 'Error'
    tituloInfo.style.color = "#d63232ff"; 
    window.location.href = 'loginpage.html'; 
}

function payloadDoToken(token) {
    if (!token) return null;

    try {
        const payloadBase64 = token.split('.')[1];
        let base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        const stringPayload = atob(base64);
        return JSON.parse(stringPayload);
    } catch (e) {
        console.error("Erro ao processar o token:", e);
        localStorage.removeItem('token_prestador')
        window.location.href = 'loginpage.html';
    }
}

    const inicio = document.getElementById("inicio")
    const agendamentosRecebidos = document.getElementById("agendamentos-recebidos")
    const meusServicos = document.getElementById("meus-servicos")
    const disponibilidade = document.getElementById("disponibilidade")
    

    inicio.classList.add('selected');
    inicio.classList.remove('list-item')

const dadosUsuario = payloadDoToken(token);
const emailUsuario = dadosUsuario.sub
const tipoUsuario = dadosUsuario.tipo
const idUsuario = dadosUsuario.id

inicializarDashboardInicio(tipoUsuario, token);

async function inicializarDashboardInicio(tipoUsuario, token){
    const responseUsuario = await fetch('http://localhost:8765/usuarios/'+idUsuario,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!responseUsuario.ok) {
        localStorage.removeItem('token_prestador')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
    const responseServicos = await fetch('http://localhost:8765/servicos/prestador/'+idUsuario,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!responseServicos.ok) {
        localStorage.removeItem('token_prestador')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
const serviosJson = await responseServicos.json()
const usuarioJson = await responseUsuario.json();
tituloInfo.textContent = tipoUsuario+": "+usuarioJson.nome
const agendamentos = await pegarAgendamentos(token)

const hoje = new Date()
const amanha = new Date(hoje)
amanha.setDate(hoje.getDate() + 1)
const agendamentosAgendados = agendamentos.filter(a => {
    const dataAgendamento = new Date(a.dataHora); 
    return a.status === "AGENDADO" && dataAgendamento >= hoje && dataAgendamento < amanha;
});
const agendamentoConfirmadosTitulo = document.getElementById('titulo-agendamentos-futuros')
inicializarDashboardAgendamentos(agendamentosAgendados)
document.getElementById("info-agendamentos-pendentes").innerHTML = agendamentos.filter(a => a.status === "PENDENTE").length;
document.getElementById("info-meus-servicos-container").innerHTML = serviosJson.length
document.getElementById("info-agendamentos-aprovados").innerHTML = agendamentosAgendados.length

const data = hoje.toLocaleDateString('pt-BR');
agendamentoConfirmadosTitulo.innerText = `Agenda de Hoje (${data})`
const dataSplit = data.split("/")
document.getElementById('p-titulo-info-aprovado').innerText = `Agendamentos Aprovados Hoje (${dataSplit[0]}/${dataSplit[1]})`

if (agendamentosAgendados.length > 0) {
    const proximoAgendamento = agendamentosAgendados.reduce((menor, atual) => {
        return new Date(atual.dataHora) < new Date(menor.dataHora) ? atual : menor;
    });
    const dataFormatada = new Date(proximoAgendamento.dataHora).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const responseCliente = await fetch('http://localhost:8765/usuarios/'+proximoAgendamento.clienteId,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!responseUsuario.ok) {
        localStorage.removeItem('token_prestador')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        //window.location.href = 'loginpage.html';  
    }
    const cliente = await responseCliente.json()
    document.getElementById('info-proximo-agendamento').innerText = `Próximo: ${dataFormatada} - ${cliente.nome}`
}
}

async function pegarAgendamentos(token) {
    const response = await fetch('http://localhost:8765/agendamentos/prestador/'+idUsuario,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!response.ok) {
        localStorage.removeItem('token_prestador')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
    return await response.json();
}
async function inicializarDashboardAgendamentos(agendamentos){
    var pendentes = 0;
    const containerLista = document.getElementById("lista-agendamentos")
    if(agendamentos.length >= 1) {
        containerLista.innerHTML = ""
    }
    for(const agendamento of agendamentos) {
        const agendamentoCerto = criarAgendamento(agendamento, token)
        if(agendamento.status === "PENDENTE"){
           pendentes += 1; 
        }
        const config = obterConfigStatus(agendamento)
        const li = `
            <li class="li-agendamento">
                <div class="agendamento-box">
                    <div>
                        <p class="nomeservico">${(await agendamentoCerto).servico}</p>
                        <p class="nomeprestador">Cliente: ${(await agendamentoCerto).cliente}</p>
                    </div>
                    <div class="info-direita">
                        <div class="datahora">
                            <p class="horario">${(await agendamentoCerto).hora}
                        </div>
                        <span class="status-agendamento" style="color: ${config.color}; background-color: ${config.bg};">${config.label}</span>
                    </div>
                </div>
            </li>
        `;
      containerLista.innerHTML += li;
    }
    return pendentes
}
async function criarAgendamento(agendamento, token) {
    const dataObjeto = new Date(agendamento.dataHora);
    const hora = dataObjeto.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const data = dataObjeto.toLocaleDateString('pt-BR');

    const responseServico = await fetch('http://localhost:8765/servicos/'+agendamento.servicoId,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!responseServico.ok) {
        localStorage.removeItem('token_prestador')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
    const servico = await responseServico.json();
    const responseCliente = await fetch('http://localhost:8765/usuarios/'+agendamento.clienteId,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!responseCliente.ok) {
        localStorage.removeItem('token_prestador')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
    const cliente = await responseCliente.json();
    const novoAgendamento = {
        servico: servico.nome,
        cliente: cliente.nome,
        hora: hora,
        data: data,
        status: agendamento.status
    };
    return novoAgendamento;
}
async function paginaMeusServicos() {
    const infoContainer = document.getElementById('informations-container')
    if(!meusServicos.classList.contains('selected') || abaServico === true){
    abaServico = false
    const opcaoSelecionada = document.querySelector('.selected')        
    opcaoSelecionada.classList.remove('selected')
    opcaoSelecionada.classList.add('list-item')    
    meusServicos.classList.add('selected')
    meusServicos.classList.remove('list-item')
    infoContainer.innerHTML = `
    <div class="meus-servicos-container container">
            <button onclick="criarServico()" id="novo-servico-btn">+ Novo Serviço</button>
             <div id="lista-servicos">
             </div>
    </div>
    `
    const containerServico = document.getElementById('lista-servicos')
    const response = await fetch('http://localhost:8765/servicos/prestador/'+idUsuario,    {
            method: 'GET',
            headers: { 
            'Content-Type': 'application/json', 'Authorization': token,
            },
            });
        if  (!response.ok) {
            localStorage.removeItem('token_prestador')
            tituloInfo.textContent = 'Error'
            tituloInfo.style.color = "#d63232ff";
            window.location.href = 'loginpage.html'; 
        }
    const servicos = await response.json()
    for(const servicosObj of servicos) {
    const htmlContainer = `
                <div class="container-info-servicos li-agendamento">
                    <div> 
                        <div>
                            <div class="nome-tempo">
                                <h3>${servicosObj.nome}</h3>
                                <p class="p-tempo">(${servicosObj.duracaoMinutos}min)</p>
                            </div>
                            <p class="p-desc">${servicosObj.descricao}</p>
                            <p class="p-valor">R$ ${servicosObj.preco}</p>
                        </div>
                    </div>
                    <div class="editar-excluir">
                        <p class="p-editar">Editar</p>
                        <p class="p-excluir">Excluir</p>
                    </div>
                </div>
    `
    containerServico.insertAdjacentHTML('afterEnd',htmlContainer)
    const editarBtn = document.querySelector(`.p-editar`)
    const excluirBtn = document.querySelector(`.p-excluir`)
    excluirBtn.addEventListener('click', () => {
    excluir(servicosObj);
    });
    editarBtn.addEventListener('click', () => {
    editar(servicosObj);
    });
    }
    }
}
async function criarServico() {
    const html = `
    <div id="agendamento-confirmado">
            <div id="servico-editar-container">
                <h3>Criar novo Serviço:</h3>
                <p id="p-agendamento-confirmado">Os horarios serão distribuidos conforme sua disponibilidade já configurada na aba <strong>Disponibilidade</strong></p>
                
                <form onsubmit="login(event)">
                    <label for="nome" class="label-login">Nome</label>
                    <input placeholder="Nome do serviço" type="text" name="nome" id="nome" class="input-login">
                    
                    <label for="descricao" class="label-login">Descrição</label>
                    <input placeholder="Descrição.." type="text" name="descricao" id="descricao" class="input-login">

                    <label for="duracao" class="label-login">Duração</label>
                    <input placeholder="60" type="number" name="duracao" id="duracao" class="input-login">

                    <label for="preco" class="label-login">Preço</label>
                    <input placeholder="$" type="number" name="preco" id="preco" class="input-login">
 
                <div id="div-sair-excluir">
                <input type="button" name="login" value="Salvar" id="btn-salvar" class="btn-salvar-servico">
                <button id="btn-sair" class="btn-sair-servico-editado" onclick="sairEditor()">Cancelar</button>
                </form>
                </div>
            </div>
        </div>
    `
    const aba = document.createElement("div")
    aba.innerHTML = html
    document.body.appendChild(aba) 
    const salvarBtn = document.getElementById(`btn-salvar`)
    salvarBtn.addEventListener('click', () => {
    const inputNome = document.getElementById('nome');
    const inputDescricao = document.getElementById('descricao');
    const inputPreco = document.getElementById('preco');
    const inputDuracao = document.getElementById('duracao');
    const servicoObj = {
        prestadorId: idUsuario,
        nome: inputNome.value,
        descricao: inputDescricao.value,
        duracaoMinutos: inputDuracao.value,
        preco: inputPreco.value
    }
    salvarCriarServico(servicoObj);
    });
}
async function salvarCriarServico(servicoObj) {
    const responseServico = await fetch('http://localhost:8765/servicos',    {
        method: 'POST',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
        body: JSON.stringify(servicoObj)
    });
    if (!responseServico.ok) {
        localStorage.removeItem('token_prestador')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
    const aba = document.getElementById('agendamento-confirmado')
    aba.remove()
    abaServico = true
    paginaMeusServicos()
}
async function editar(servicosObj){
    const html = `
    <div id="agendamento-confirmado">
            <div id="servico-editar-container">
                <h3>Editar Serviço: ${servicosObj.nome}</h3>
                <p id="p-agendamento-confirmado">Agendamentos já confirmados não serão alterados!</p>
                
                <form onsubmit="login(event)">
                    <label for="preco" class="label-login">Preço</label>
                    <input placeholder="${servicosObj.preco}" type="number" name="preco" id="preco" class="input-login">

                    <label for="duracao" class="label-login">Duração</label>
                    <input placeholder="${servicosObj.duracaoMinutos}" type="number" name="duracao" id="duracao" class="input-login">                                
                <div id="div-sair-excluir">
                <input type="button" name="login" value="Salvar" id="btn-salvar" class="btn-salvar-servico">
                <button id="btn-sair" class="btn-sair-servico-editado" onclick="sairEditor()">Cancelar</button>
                </form>
                </div> 
            </div>
        </div>
    `
    const aba = document.createElement("div")
    aba.innerHTML = html
    document.body.appendChild(aba) 
    const salvarBtn = document.getElementById(`btn-salvar`)
    salvarBtn.addEventListener('click', () => {
    const inputPreco = document.getElementById('preco');
    const inputDuracao = document.getElementById('duracao');
    salvarServico(servicosObj, inputPreco, inputDuracao);
    });
}
async function salvarServico(servicosObj, inputPreco, inputDuracao){
    if(inputPreco.value === "") {
        inputPreco.value = servicosObj.preco
    }
    if(inputDuracao.value === "") {
        inputDuracao.value = servicosObj.duracaoMinutos
    }
    servicosObj.preco = inputPreco.value
    servicosObj.duracaoMinutos = inputDuracao.value
    servicosObj.prestadorId = idUsuario
    const aba = document.getElementById('agendamento-confirmado')
     const responseServico = await fetch('http://localhost:8765/servicos',    {
        method: 'PUT',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
        body: JSON.stringify(servicosObj)
    });
    aba.remove()
    abaServico = true
    paginaMeusServicos()
}
async function sairEditor() {
    const aba = document.getElementById('agendamento-confirmado')
    aba.remove()
}
async function excluir(servicosObj){
    const html = `
    <div id="agendamento-confirmado">
            <div id="servico-excluir-container">
                <h3>Excluir Serviço: ${servicosObj.nome}?</h3>
                <p id="p-agendamento-confirmado">Essa ação não pode ser desfeita!</p>
                <p></p>
                <div id="div-sair-excluir">
                <button id="btn-sair" class="btn-sair-servico" onclick="sairServico()">Voltar</button>
                <button id="btn-excluir" class="btn-excluir-servico">Excluir</button>
                </div>
            </div>
        </div>
    `
    const aba = document.createElement("div")
    aba.innerHTML = html
    document.body.appendChild(aba)
    const excluirBtn = document.getElementById(`btn-excluir`)
    excluirBtn.addEventListener('click', () => {
    excluirServico(servicosObj);
    });
}
async function sairServico() {
    const aba = document.getElementById('agendamento-confirmado')
    aba.remove()
}
async function excluirServico(servico) {
    
    const responseCliente = await fetch('http://localhost:8765/servicos/'+servico.id,    {
        method: 'DELETE',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    const aba = document.getElementById('agendamento-confirmado')
    aba.remove()
    paginaMeusServicos()
}
async function paginaAgendamentosRecebidos() {
    const infoContainer = document.getElementById('informations-container')
    if(!agendamentosRecebidos.classList.contains('selected') || abaAgendamento === true){
    const opcaoSelecionada = document.querySelector('.selected')        
    opcaoSelecionada.classList.remove('selected')
    opcaoSelecionada.classList.add('list-item')    
    agendamentosRecebidos.classList.add('selected')
    agendamentosRecebidos.classList.remove('list-item')
    const agendamentos = await pegarAgendamentos(token)
       infoContainer.innerHTML = `
    <div id="agendamento-informations">
                <section class="agendamento-lista container">
                    <p id="titulo-agendamentos-recebidos">Aqui você gerencia todos os agendamentos feitos por clientes.</p>
                    <ul id="lista-agendamentos">
                        <li class="li-agendamento">
                            <div class="agendamento-box">
                                <div style="margin: auto;">
                                    <p class="nomeservico" style="font-size: medium; font-weight: 500;">Nenhum agendamento encontrado...</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
    ` 
    if(agendamentos.length >= 1) {
    infoContainer.innerHTML = `
    <div id="agendamento-informations">
                <section class="agendamento-lista container">
                <p id="titulo-agendamentos-recebidos">Aqui você gerencia todos os agendamentos feitos por clientes.</p>
                <div id="agendamentos-filtro">
                        <ul class="nav-filter">
                            <li id="pendentes" class="filter-selected" onclick="filtroPendentes()">Pendentes</li>
                            <li id="aprovados" class="filtro-item" onclick="filtroAprovados()"">Aprovados</li>
                            <li id="rejeitados" class="filtro-item" onclick="filtroCancelados()">Cancelados</li>
                            <li id="outros" class="filtro-item" onclick="filtroOutros()">Outros</li>
                        </ul>
                    </div>
                    <ul id="lista-agendamentos">
                        <li class="li-agendamento">
                            <div class="agendamento-box">
                                <div style="margin: auto;">
                                    <p class="nomeservico" style="font-size: medium; font-weight: 500;">Nenhum agendamento encontrado...</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
    `
    filtroPendentes()
    }
    abaAgendamento = false
}
}
async function inicializarAgendamentosRecebidos(agendamentos){
    const containerLista = document.getElementById("lista-agendamentos")
    if(agendamentos.length >= 1) {
        containerLista.innerHTML = ""
    }
    var loop = 0
    var faltou = false
    for(const agendamento of agendamentos) {
        const dataAgendamento = new Date(agendamento.dataHora)
        const dataAgendamento24h = new Date(dataAgendamento.getTime() + (24 * 60 * 60 * 1000))
        const agendamentoCerto = criarAgendamento(agendamento, token)
        const agendamentoObj = await agendamentoCerto
        const config = obterConfigStatus(agendamento)
 
        let botoesAcao = '';
        let faltas = '';
        const responseCliente = await fetch('http://localhost:8765/usuarios/'+agendamento.clienteId,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
        });
        const cliente = await responseCliente.json();
        if (agendamento.status === 'PENDENTE') {
        botoesAcao = `
            <div class="confirmar-agendamento">Aprovar</div>
            <div class="rejeitar-agendamento">Rejeitar</div>
            `
            faltas = `
            | Faltas: ${cliente.faltas}
            `
        } else if (agendamento.status === 'AGENDADO') {
            botoesAcao = `<p class="cancelar-p">Cancelar</p>`
        } else if (agendamento.status === 'CONCLUIDO' && dataAgendamento24h > new Date()) {
            botoesAcao = `<div class="confirmar-falta">Faltou</div>`
            faltou = true
        }
        const liHTML = `
            <li class="li-agendamento">
                <div class="agendamento-box">
                    <div>
                        <p class="nomeservico">${agendamentoObj.servico}</p>
                        <p class="nomeprestador">Cliente: ${agendamentoObj.cliente}${faltas}</p>
                    </div>
                    <div class="info-direita">
                        ${['PENDENTE', 'AGENDADO'].includes(agendamentoObj.status) ? `
                        <div class="datahora">
                            <p class="horario">${agendamentoObj.hora}</p>
                            <p class="data">${agendamentoObj.data}</p>
                        </div>` : ''}
                        <span class="status-agendamento" style="color: ${config.color}; background-color: ${config.bg};">
                        ${config.label}
                        </span>
                        ${botoesAcao}
                    </div>
                </div>
            </li>
            `;
        containerLista.insertAdjacentHTML('beforeend', liHTML);
        if (agendamento.status === 'PENDENTE') {
            const aprovarBtn = document.querySelectorAll(`.confirmar-agendamento`)[loop]
            const rejeitarBtn = document.querySelectorAll(`.rejeitar-agendamento`)[loop]
            aprovarBtn.addEventListener('click', () => {
            aprovarAgendamento(agendamento);
            });
            rejeitarBtn.addEventListener('click', () => {
            rejeitarAgendamento(agendamento);
            });
        }
        if (agendamento.status === 'AGENDADO') {
            const rejeitarBtn = document.querySelectorAll(`.cancelar-p`)[loop]
            rejeitarBtn.addEventListener('click', () => {
            cancelarAgendamento(agendamento);
            });
        } 
        if (agendamento.status === 'CONCLUIDO' && dataAgendamento24h > new Date() && faltou == true) {
            console.log(loop)
            const faltouBtn = document.querySelectorAll(`.confirmar-falta`)[loop]
            faltouBtn.addEventListener('click', () => {
            faltouAgendamento(agendamento);
            });
            faltou = false
            loop += 1
            continue;
        }
        if(agendamento.status ===`CONCLUIDO`) {
            continue;
        }
        loop += 1
    }
}
async function faltouAgendamento(agendamento) {
     const response = await fetch('http://localhost:8765/agendamentos/faltou/'+agendamento.id,    {
        method: 'PUT',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    abaAgendamento = true
    filtroOutros()
}
async function aprovarAgendamento(agendamento) {
    const response = await fetch('http://localhost:8765/agendamentos/aprovar/'+agendamento.id,    {
        method: 'PUT',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!response.ok) {
        localStorage.removeItem('token_prestador')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        //window.location.href = 'loginpage.html';  
    }
    abaAgendamento = true
    paginaAgendamentosRecebidos()
}
async function rejeitarAgendamento(agendamento) {
    const response = await fetch('http://localhost:8765/agendamentos/recusar/'+agendamento.id,    {
        method: 'PUT',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!response.ok) {
        localStorage.removeItem('token_prestador')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
    abaAgendamento = true
    paginaAgendamentosRecebidos()
}
async function cancelarAgendamento(agendamento) {
    const response = await fetch('http://localhost:8765/agendamentos/cancelar/'+agendamento.id,    {
        method: 'PUT',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!response.ok) {
        localStorage.removeItem('token_prestador')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
    abaAgendamento = true
    filtroAprovados()
}
async function filtroOutros() {
    const lista = await pegarAgendamentos(token);
    const agendamentosAgendados = lista.filter(a => a.status === "CONCLUIDO" || a.status === "FALTOU");
    const todos = document.getElementById("outros")
    const filtrosSelecionados = document.querySelectorAll('.filter-selected');
    filtrosSelecionados.forEach(filtro => {
        filtro.classList.remove('filter-selected');
        filtro.classList.add('filtro-item');
    });
    todos.classList.remove("filtro-item")
    todos.classList.add("filter-selected")
    if(agendamentosAgendados.length === 0) {
        const html = `
        <li class="li-agendamento">
                            <div class="agendamento-box">
                                <div style="margin: auto;">
                                    <p class="nomeservico" style="font-size: medium; font-weight: 500;">Nenhum agendamento encontrado...</p>
                                </div>
                            </div>
        </li>
        `
        const listAgendamento = document.getElementById('lista-agendamentos')
        listAgendamento.innerHTML=html
    }else{
    inicializarAgendamentosRecebidos(agendamentosAgendados)
    }
}
async function filtroPendentes() {
    const lista = await pegarAgendamentos(token);
    const agendamentosPendentes = lista.filter(a => a.status === "PENDENTE");
    const filtrosSelecionados = document.querySelectorAll('.filter-selected');

    filtrosSelecionados.forEach(filtro => {
        filtro.classList.remove('filter-selected');
        filtro.classList.add('filtro-item');
    });
    const pendentes = document.getElementById("pendentes")
    pendentes.classList.remove("filtro-item")
    pendentes.classList.add("filter-selected")
    if(agendamentosPendentes.length === 0) {
        const html = `
        <li class="li-agendamento">
                            <div class="agendamento-box">
                                <div style="margin: auto;">
                                    <p class="nomeservico" style="font-size: medium; font-weight: 500;">Nenhum agendamento pendente...</p>
                                </div>
                            </div>
        </li>
        `
        const listAgendamento = document.getElementById('lista-agendamentos')
        listAgendamento.innerHTML=html
    }else{
    inicializarAgendamentosRecebidos(agendamentosPendentes)
    }
}
async function filtroAprovados() {
    const lista = await pegarAgendamentos(token);
    const agendamentosAgendados = lista.filter(a => a.status === "AGENDADO");
    const filtrosSelecionados = document.querySelectorAll('.filter-selected');
    filtrosSelecionados.forEach(filtro => {
        filtro.classList.remove('filter-selected');
        filtro.classList.add('filtro-item');
    });
    const aprovados = document.getElementById("aprovados")
    aprovados.classList.remove("filtro-item")
    aprovados.classList.add("filter-selected")
if(agendamentosAgendados.length === 0) {
        const html = `
        <li class="li-agendamento">
                            <div class="agendamento-box">
                                <div style="margin: auto;">
                                    <p class="nomeservico" style="font-size: medium; font-weight: 500;">Nenhum agendamento confirmado...</p>
                                </div>
                            </div>
        </li>
        `
        const listAgendamento = document.getElementById('lista-agendamentos')
        listAgendamento.innerHTML=html
    }else{
    inicializarAgendamentosRecebidos(agendamentosAgendados)
    }
}
async function filtroCancelados() {
    const lista = await pegarAgendamentos(token);
    const agendamentosCancelados = lista.filter(a => a.status === "RECUSADO" || a.status === "CANCELADO" || a.status === "FALTOU");
    const filtrosSelecionados = document.querySelectorAll('.filter-selected');

    filtrosSelecionados.forEach(filtro => {
        filtro.classList.remove('filter-selected');
        filtro.classList.add('filtro-item');

        filtro.addEventListener('mouseover', () => {
            filtro.classList.add('hover-effect-filter');
        });

        filtro.addEventListener('mouseout', () => {
            filtro.classList.remove('hover-effect-filter');
        });
    });
    const rejeitados = document.getElementById("rejeitados")
    rejeitados.classList.remove("filtro-item")
    rejeitados.classList.add("filter-selected")
    rejeitados.addEventListener('mouseover', () => {
    rejeitados.classList.remove('hover-effect-filter');
    });
    if(agendamentosCancelados.length === 0) {
        const html = `
        <li class="li-agendamento">
                            <div class="agendamento-box">
                                <div style="margin: auto;">
                                    <p class="nomeservico" style="font-size: medium; font-weight: 500;">Nenhum agendamento cancelado...</p>
                                </div>
                            </div>
        </li>
        `
        const listAgendamento = document.getElementById('lista-agendamentos')
        listAgendamento.innerHTML=html
    }else{
    inicializarAgendamentosRecebidos(agendamentosCancelados)
    }
}
async function inicioStart() {
    if(!inicio.classList.contains('selected')){
    const opcaoSelecionada = document.querySelector('.selected')        
    opcaoSelecionada.classList.remove('selected')
    opcaoSelecionada.classList.add('list-item')
    inicio.classList.add('selected')
    inicio.classList.remove('list-item')
    const html = `
            <div id="sugestion-container">
                <section class="info-section">
                    <div onclick="paginaAgendamentosRecebidos()" class="info-container container" id="agendamentos-pendentes">
                        <p class="p-titulo-info">Agendamentos Pendentes</p>
                        <p id="info-agendamentos-pendentes">0</p>
                        <p>Clique para Aprovar/Rejeitar</p>
                    </div>
                    <div onclick="paginaMeusServicos()" class="info-container container" id="meus-servicos-container">
                        <p class="p-titulo-info">Meus Serviços</p>
                        <p id="info-meus-servicos-container">0</p>
                        <p>Gerencie e edite seus serviços</p>
                    </div>
                    <div class="info-container-aprovados container" id="agendamentos-aprovados">
                        <p class="p-titulo-info" id="p-titulo-info-aprovado">Agendamentos Aprovados Hoje (20/12)</p>
                        <p id="info-agendamentos-aprovados">0</p>
                        <p id="info-proximo-agendamento">Próximo: Nenhum</p>
                    </div>
                </section>
            </div>
            <div id="agendamento-informations">
                <section class="agendamento-lista container">
                    <h2 id="titulo-agendamentos-futuros">Agenda de Hoje (20/12/2025)</h2>
                    <ul id="lista-agendamentos">
                        <li class="li-agendamento">
                            <div class="agendamento-box">
                                <div style="margin: auto;">
                                    <p class="nomeservico" style="font-size: medium; font-weight: 500;">Nenhum agendamento confirmado para hoje...</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
    `
    const divInformation = document.getElementById("informations-container")
    divInformation.innerHTML = html
    inicializarDashboardInicio(tipoUsuario, token);
    }
}
async function paginaDisponibilidade() {
    const infoContainer = document.getElementById('informations-container')
    if(!disponibilidade.classList.contains('selected') || abaServico === true){
    abaServico = false
    const opcaoSelecionada = document.querySelector('.selected')        
    opcaoSelecionada.classList.remove('selected')
    opcaoSelecionada.classList.add('list-item')    
    disponibilidade.classList.add('selected')
    disponibilidade.classList.remove('list-item')

    infoContainer.innerHTML = `<div class="meus-servicos-container container">
            <h1 id="titulo-disponibilidade">Disponibilidade Recorrente</h1>
            <p>Defina seus horários de trabalho. Clientes só podem agendar nestes períodos.</p>
                <div id="bloco-disponibilidade">
                        <h2 id="h2-disponibilidade">Adicionar Novo Bloco de Horário</h2>   
                        <div>
                            <form id="disponibilidade-section">
                            <select class="input-disponibilidade" required id="dia" name="dia">
                                <option value="" disabled selected hidden>Dia da Semana</option>
                                <option value="1">Segunda</option>
                                <option value="2">Terça</option>
                                <option value="3">Quarta</option>
                                <option value="4">Quinta</option>
                                <option value="5">Sexta</option>
                            </select>
                                <input class="input-disponibilidade" required type="time" name="inicioH" id="inicioH">
                                <input class="input-disponibilidade" required type="time" name="fimH" id="fimH">
                                <input type="submit" value="Salvar" name="salvar" id="submit-disponibilidade">  
                            </form>
                        </div> 
                    </div>
                <div id="container-disponibilidades">
                    <ul id="lista-disponibilidades">
                        <li class="li-agendamento">
                            <div class="disponibilidade">
                                <div class="agendamento-box">
                                    <div style="margin: auto;">
                                        <p class="nomeservico" style="font-size: medium; font-weight: 500;">Você não tem nenhuma disponibilidade definida...</p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>`

        const form = document.getElementById("disponibilidade-section")
        const divDisponibilidade = document.getElementById('lista-disponibilidades')
        const responseUsuario = await fetch('http://localhost:8765/usuarios/disponibilidade/prestador/'+idUsuario,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
        });
        if (!responseUsuario.ok) {
            localStorage.removeItem('token_prestador')
            tituloInfo.textContent = 'Error'
            tituloInfo.style.color = "#d63232ff";
            window.location.href = 'loginpage.html';  
        }
        const ordemPrioridade = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA"];
        const listaDisponibilidades = await responseUsuario.json()
        listaDisponibilidades.sort((a, b) => {
            return ordemPrioridade.indexOf(a.diaDaSemana) - ordemPrioridade.indexOf(b.diaDaSemana);
        });
        if(listaDisponibilidades.length >= 1) {
            divDisponibilidade.innerHTML = ""
            var loop = 0
            for(const disponibilidade of listaDisponibilidades) {
            const [hIni, mIni] = disponibilidade.inicio.split(":").map(Number)
            let inicioMinuto = hIni * 60 + mIni
            const hI = String(Math.floor(inicioMinuto / 60)).padStart(2, "0")
            const mI = String(inicioMinuto % 60).padStart(2, "0")
            const [hfim, mfim] = disponibilidade.fim.split(":").map(Number)
            let fimMinuto = hfim * 60 + mfim
            const hF = String(Math.floor(fimMinuto / 60)).padStart(2, "0")
            const mF = String(fimMinuto % 60).padStart(2, "0")
        
                const li = `
            <li class="li-agendamento">
                <div class="agendamento-box">
                    <div>
                        <p id="${mapaSemana[disponibilidade.diaDaSemana]}" class="dia-da-semana">${mapaSemana[disponibilidade.diaDaSemana]}</p>
                        <p class="disponibilidade-hora">${hI}:${mI} - ${hF}:${mF}</p>
                    </div>
                    <div class="info-direita">
                        <div class="datahora">
                            <p class="remover">Remover</p>
                        </div>
                    </div>
                </div>
            </li>
        `;
        const div = document.createElement('div')
        div.innerHTML = li
        divDisponibilidade.appendChild(div)
        const removerBtn = document.querySelectorAll('.remover')
        removerBtn[loop].addEventListener('click', () => {
        const html = `
            <div id="agendamento-confirmado">
                    <div id="servico-excluir-container">
                        <h3>Excluir Disponibilidade?</h3>
                        <p class="dia-da-semana">${disponibilidade.diaDaSemana}</p>
                        <p class="disponibilidade-hora">${hI}:${mI} - ${hF}:${mF}</p>
                        <div id="div-sair-excluir">
                        <button id="btn-sair" class="btn-sair-servico" onclick="sairServico()">Voltar</button>
                        <button id="btn-excluir" class="btn-excluir-servico">Excluir</button>
                        </div>
                    </div>
                </div>
    `
    const aba = document.createElement("div")
    aba.innerHTML = html
    document.body.appendChild(aba)  
    const btnExcluir = document.getElementById("btn-excluir")     
            btnExcluir.addEventListener('click', () => {  
            removerDisponibilidade(disponibilidade)
            })
        })
        loop += 1
        }
        }
        form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const diaDaSemana = document.getElementById('dia')
        const inicio = document.getElementById('inicioH')
        const fim = document.getElementById('fimH')
        const disponibilidade = {
            prestadorId: idUsuario,
            diaDaSemana: mapaDias[diaDaSemana.value],
            inicio: inicio.value,
            fim: fim.value
        }
        const diasDaSemanaJaAdicionados = document.getElementById(mapaSemana[disponibilidade.diaDaSemana])
        if(diasDaSemanaJaAdicionados) {
            console.log('ja existe pamonha!')
        }else{
        adicionarDisponibilidade(disponibilidade);
        }
        });
    }
}
async function removerDisponibilidade(disponibilidade) {
    const responseUsuario = await fetch('http://localhost:8765/usuarios/disponibilidade/prestador/'+disponibilidade.idDisponibilidade,    {
        method: 'DELETE',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
        });
        abaServico = true
        const aba = document.getElementById('agendamento-confirmado')
        aba.remove()
        paginaDisponibilidade()
}
async function adicionarDisponibilidade(disponibilidade) {
    console.log(disponibilidade)
    const responseUsuario = await fetch('http://localhost:8765/usuarios/disponibilidade/prestador',    {
        method: 'POST',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
        body: JSON.stringify(disponibilidade)
        });
        if (!responseUsuario.ok) {
            localStorage.removeItem('token_prestador')
            tituloInfo.textContent = 'Error'
            tituloInfo.style.color = "#d63232ff";
            window.location.href = 'loginpage.html';  
        }
        abaServico = true
        paginaDisponibilidade()
}
function obterConfigStatus(agendamento) {
    const statusMap = {
    AGENDADO: { label: "Agendado", color: "#10b981", bg: "rgb(16 185 129 / 0.2)" },
    PENDENTE: { label: "Pendente", color: "#fbbf24", bg: "rgb(251 191 36 / 0.2)" },
    RECUSADO: { label: "Recusado", color: "#ef4444", bg: "rgb(239 68 68 / 0.2)" },
    CANCELADO: { label: "Cancelado", color: "#6b7280", bg: "rgb(107 114 128 / 0.2)" },
    CONCLUIDO: { label: "Concluído", color: "#3b82f6", bg: "rgb(59 130 246 / 0.2)" }, 
    FALTOU:    { label: "Faltou",    color: "#f97316", bg: "rgb(249 115 22 / 0.2)" }
    };

    const config = statusMap[agendamento.status];
    return config
    }
    function sair() {
    localStorage.removeItem('token_prestador')
    window.location.href = 'loginpage.html';
}
function toLocalDateTimeString(data) {
    const pad = n => n.toString().padStart(2, '0')
    return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}` + `T${pad(data.getHours())}:${pad(data.getMinutes())}:${pad(data.getSeconds())}`
}