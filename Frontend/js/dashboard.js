const token = localStorage.getItem('token_usuario')
const tituloInfo = document.getElementById('usuario-infos')
var abaServico = false
const mapaDias = {
    SEGUNDA: 1,
    TERCA: 2,
    QUARTA: 3,
    QUINTA: 4,
    SEXTA: 5
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
        localStorage.removeItem('token_usuario')
        window.location.href = 'loginpage.html';
    }
}

    const inicio = document.getElementById("inicio")
    const agendarServico = document.getElementById("agendar")
    const meusAgendamentos = document.getElementById("agendamentos-usuario")
    

    inicio.classList.add('selected');

const dadosUsuario = payloadDoToken(token);
const emailUsuario = dadosUsuario.sub
const tipoUsuario = dadosUsuario.tipo
const idUsuario = dadosUsuario.id

inicializarDashboardInicio(tipoUsuario, token);

async function inicializarDashboardInicio(tipoUsuario, token){
    const response = await fetch('http://localhost:8765/usuarios/'+idUsuario,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!response.ok) {
        localStorage.removeItem('token_usuario')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
const usuarioJson = await response.json();
tituloInfo.textContent = tipoUsuario+": "+usuarioJson.nome
const agendamentos = await pegarAgendamentos(token)
const faltasNumero = document.getElementById("faltas-numero")
faltasNumero.innerText = usuarioJson.faltas

const agendamentosAgendados = agendamentos.filter(a => a.status === "AGENDADO");
inicializarDashboardAgendamentos(agendamentosAgendados)
document.getElementById("valor-agendamentos-pendentes").innerHTML = agendamentos.filter(a => a.status === "PENDENTE").length;
}

async function pegarAgendamentos(token) {
    const response = await fetch('http://localhost:8765/agendamentos/usuario/'+idUsuario,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!response.ok) {
        localStorage.removeItem('token_usuario')
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
                        <p class="nomeprestador">Prestador: ${(await agendamentoCerto).prestador}</p>
                    </div>
                    <div class="info-direita">
                        <div class="datahora">
                            <p class="horario">${(await agendamentoCerto).hora}</p>
                            <p class="data">${(await agendamentoCerto).data}</p>
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

function sair() {
    localStorage.removeItem('token_usuario')
    window.location.href = 'loginpage.html';
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
        localStorage.removeItem('token_usuario')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
    const servico = await responseServico.json();
    const responsePrestador = await fetch('http://localhost:8765/usuarios/'+agendamento.prestadorId,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!responsePrestador.ok) {
        localStorage.removeItem('token_usuario')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
    const prestador = await responsePrestador.json();
    const novoAgendamento = {
        servico: servico.nome,
        prestador: prestador.nome,
        hora: hora,
        data: data,
        status: agendamento.status
    };
    return novoAgendamento;
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
async function iniciarAgendarServico() {
    if(inicio.classList.contains('selected')){
        inicio.classList.remove('selected')  
        inicio.classList.add('list-item')  
    }
    if(meusAgendamentos.classList.contains('selected')){
        meusAgendamentos.classList.remove('selected')  
        meusAgendamentos.classList.add('list-item')  
    }
    if(!(agendarServico.classList.contains('selected')) || abaServico === true){
        const informationContainer = document.getElementById("informations-container")
        informationContainer.innerHTML = `<p style="color: rgb(75 85 99); font-size: 1.125rem;margin-bottom: 1.5rem;">Escolha o serviço desejado para ver a disponibilidade do prestador.</p>`

        const response = await fetch('http://localhost:8765/servicos',    {
            method: 'GET',
            headers: { 
               'Content-Type': 'application/json', 'Authorization': token,
            },
        });
        if (!response.ok) {
            localStorage.removeItem('token_usuario')
            tituloInfo.textContent = 'Error'
            tituloInfo.style.color = "#d63232ff";
            window.location.href = 'loginpage.html';  
        }
        const listaServicos = await response.json();
        if(listaServicos.length < 1) {
            const htmlServico = `
        <div class="servico-box">
                    <div id="agendamento-informations">
                
                    <ul id="lista-agendamentos" style="margin-bottom: -12px">
                        <li class="li-agendamento">
                            <div class="agendamento-box">
                                <div style="margin: auto;">
                                    <p class="nomeservico" style="font-size: medium; font-weight: 500;">Nenhum serviço encontrado...</p>
                                </div>
                            </div>
                        </li>
                    </ul>
            </div>  
        
        `
        informationContainer.innerHTML += htmlServico
        agendarServico.classList.remove('list-item')
        agendarServico.classList.add('selected')
        }
        for(const servico of listaServicos) {
            console.log(servico)
            const response = await fetch('http://localhost:8765/usuarios/'+servico.prestador_id,    {
            method: 'GET',
            headers: { 
            'Content-Type': 'application/json', 'Authorization': token,
            },
            });
        if  (!response.ok) {
            localStorage.removeItem('token_usuario')
            tituloInfo.textContent = 'Error'
            tituloInfo.style.color = "#d63232ff"; 
            window.location.href = 'loginpage.html';  
        }
        const prestador = await response.json();
        const htmlServico = `
        <div class="servico-box">
                        <div class="servico-container">
                            <div>
                                <h3 class="nome-novo-servico">${servico.nome}</h3>
                                <p class="nome-novo-prestador">Prestador: <span class="nome-prestador">${prestador.nome}</span></p>
                                <div class="container-tempo-valor">
                                    <svg class="icon-time" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <p class="duracao">${servico.duracaoMinutos}min</p>
                                    <p class="valor">R$ ${servico.preco}</p>
                                </div>
                            </div>
                            <div>
                                <button class="agendar-btn" onclick="agendarAgora(${servico.id})">Agendar Agora</button>
                            </div>
                        </div>
                    </div>
        `
        informationContainer.innerHTML += htmlServico
        agendarServico.classList.remove('list-item')
        agendarServico.classList.add('selected')
        }
        abaServico = false
    }
}
async function agendarAgora(servico) {
    abaServico = true
    const response = await fetch('http://localhost:8765/servicos/'+servico,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!response.ok) {
        localStorage.removeItem('token_usuario')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
    const servicoObj = await response.json();
    const responsePrestador = await fetch('http://localhost:8765/usuarios/'+servicoObj.prestador_id,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!responsePrestador.ok) {
        localStorage.removeItem('token_usuario')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
    const prestador = await responsePrestador.json();
    const responseDisponibilidade = await fetch('http://localhost:8765/usuarios/disponibilidade/prestador/'+prestador.id,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!responseDisponibilidade.ok) {
        localStorage.removeItem('token_usuario')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
    const disponibilidadePrestador = await responseDisponibilidade.json();
    const htmlServicoAgendar =
    `<div class="container-flex-agendar-servico">
        <div class="container-servico">
                <div class="agendar-servico-container">
                    <div>
                        <h2 class="titulo-servico">Agendar: ${servicoObj.nome} com ${prestador.nome}</h2>
                    </div>
                    <div class="valores-servico-container">
                        <div>
                            <p>Serviço: ${servicoObj.duracaoMinutos}min</p>
                        </div>
                        <div>
                            <p class="agendar-servico-valor">| Valor: R$ ${servicoObj.preco}</p>
                        </div>
                    </div>
                    <p id="desc-p">${servicoObj.descricao}</p>
                    <div class="agendar-voltar-container">
                        <ul class="dias-da-semana">
                        <li id="SEGUNDA" class="semana-li-desabilitada">Segunda</li>
                        <li id="TERCA" class="semana-li-desabilitada">Terça</li>
                        <li id="QUARTA" class="semana-li-desabilitada">Quarta</li>
                        <li id="QUINTA" class="semana-li-desabilitada">Quinta</li>
                        <li id="SEXTA" class="semana-li-desabilitada">Sexta</li>
                        </ul>
                        <p class="p-agendamento">Selecione um dia da semana...</p>
                        <div class="horarios-btn-container">
                        </div>
                        <div class="icon-voltar-container">
                        <svg class="icon-seta" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        <p class="voltar-agendar-servico" onclick="iniciarAgendarServico()">Voltar para a lista de serviços</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
    const informationContainer = document.getElementById("informations-container")
    informationContainer.innerHTML = htmlServicoAgendar
    for(const disponibilidade of disponibilidadePrestador) {
        const opcaoDiaDaSemana = document.getElementById(disponibilidade.diaDaSemana)
        opcaoDiaDaSemana.classList.add("semana-li")
        opcaoDiaDaSemana.classList.remove("semana-li-desabilitada")
        opcaoDiaDaSemana.addEventListener("click", () => {
        selecionarDia(disponibilidade.diaDaSemana, disponibilidadePrestador, mapaDias[disponibilidade.diaDaSemana], servicoObj, prestador.id);
        });
    }
}
async function selecionarDia(diaDaSemanaEscolhido, disponibilidadePrestador, valorDiaDaSemana, servicoObj,prestadorId) {
    const opcao = document.getElementById(diaDaSemanaEscolhido)
    opcao.classList.remove("semana-li")
    opcao.classList.add("semana-li-selected")
    for(const outrasOpcao of disponibilidadePrestador) {
        if(outrasOpcao.diaDaSemana === diaDaSemanaEscolhido) {
            continue;
        }
        const botaoOutraOpcao = document.getElementById(outrasOpcao.diaDaSemana)
        botaoOutraOpcao.classList.remove("semana-li-selected")
        botaoOutraOpcao.classList.add("semana-li")
    }

    const disponibilidadeDia = disponibilidadePrestador.find(d => d.diaDaSemana === diaDaSemanaEscolhido);

    const opcoesContainer = document.querySelector(".horarios-btn-container")
    const hoje = new Date()
    const diaDaSemanaAtual = hoje.getDay();
    const diff = (valorDiaDaSemana - diaDaSemanaAtual + 7) % 7;
    const dataCerta = new Date(hoje)
    dataCerta.setDate(hoje.getDate() + diff)

    document.querySelector(".p-agendamento").innerText = `Horários Disponíveis (${dataCerta.getDate()} de ${meses[dataCerta.getMonth()]})`
    opcoesContainer.innerHTML = ""
    
    const [hIni, mIni] = disponibilidadeDia.inicio.split(":").map(Number)
    const [hFim, mFim] = disponibilidadeDia.fim.split(":").map(Number)
    let inicioMinuto = hIni * 60 + mIni
    let fimMinuto = hFim * 60 + mFim
    for (let i = inicioMinuto; i <= fimMinuto; i += servicoObj.duracaoMinutos) {
        const h = String(Math.floor(i / 60)).padStart(2, "0")
        const m = String(i % 60).padStart(2, "0")
        const btn = document.createElement("button")
        btn.className = "horarios-btn"
        btn.textContent = `${h}:${m}`
        btn.id = `${h}-${m}`
        const dataInicio = new Date(dataCerta);
        dataInicio.setHours(h, m, 0, 0);
        const dataFim = new Date(dataInicio);
        dataFim.setMinutes(dataInicio.getMinutes() + servicoObj.duracaoMinutos)
        const agendamentoData = {
            dataHora: toLocalDateTimeString(dataInicio),
            dataHoraFim: toLocalDateTimeString(dataFim),
            prestadorId: prestadorId
        }
        opcoesContainer.appendChild(btn);
        if(hoje > dataInicio) {
            const btn = document.getElementById(`${h}-${m}`)
            btn.classList.remove("horarios-btn")
            btn.classList.add("horarios-btn-desabilitado")
        }
        const responseDisponibilidade = await fetch('http://localhost:8765/disponibilidades/disponivel',    {
        method: 'POST',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
        body: JSON.stringify(agendamentoData)
        });
        if (!responseDisponibilidade.ok) {
            localStorage.removeItem('token_usuario')
            tituloInfo.textContent = 'Error'
            tituloInfo.style.color = "#d63232ff";
            window.location.href = 'loginpage.html';  
        }
        const responseEstaDisponivel = await responseDisponibilidade.json();
        if(!responseEstaDisponivel) {
            const btn = document.getElementById(`${h}-${m}`)
            btn.classList.remove("horarios-btn")
            btn.classList.add("horarios-btn-desabilitado")
        }else{
            if(hoje > dataInicio) {
            const btn = document.getElementById(`${h}-${m}`)
            btn.classList.remove("horarios-btn")
            btn.classList.add("horarios-btn-desabilitado")
            } else {
            btn.addEventListener("click", () => {
            agendarUmServico(prestadorId, servicoObj, dataInicio, h, m);
            });
        }
        }
    }
}
async function agendarUmServico(prestadorId, servicoObj, dataInicio, h, m) {
    const botoesSelecionados = document.querySelectorAll(".horarios-btn-selected")
    botoesSelecionados.forEach(btn => {
        btn.classList.remove("horarios-btn-selected")
        btn.classList.add("horarios-btn")
    })
    const btn = document.getElementById(`${h}-${m}`)
    btn.classList.remove("horarios-btn")
    btn.classList.add("horarios-btn-selected")
    const infoAgendamento = {
        id: "",
        dataHora: toLocalDateTimeString(dataInicio),
        clienteId: idUsuario,
        servicoId: servicoObj.id,
        prestadorId: prestadorId,
        disponibilidadeOcupadaId: "",
        status: 'PENDENTE'
    }
    const mainContainer = document.querySelector('.container-flex-agendar-servico')
    const existente = mainContainer.querySelector('#confirmar-agendamento')
    if (existente) {
        existente.remove()
    }
    const div = document.createElement("div")
    div.id = "confirmar-agendamento"
    div.textContent = `texto`
    const data = dataInicio.toLocaleDateString('pt-BR');
    const html = `

        <form id="confirmar-agendamento">
            <div>
                <div class="metodo-pagamento">
                    <h3 id="titulo-pagamento"><span class="cartao-icon">💳</span>Método de Pagamento</h3>
                    <div>
                        <label for="pagamentonolocal" class="pagamento-label">
                            <input required id="pagamentonolocal" type="radio" name="pagamento" class="input-radio">
                            <div class="info-pagamento">
                                <p class="p-pagamento">Pagar no Local</p>
                                <p class="p-info">Pague diretamente o prestador após o serviço</p>
                            </div>
                        </label>
                        <label for="pix" class="pagamento-label">
                            <input required id="pix" type="radio" name="pagamento" class="input-radio">
                            <div class="info-pagamento">
                                <p class="p-pagamento">Pix Instantâneo</p>
                                <p class="p-info">Em caso de cancelamento do prestador, reembolso garantido.</p>
                            </div>
                        </label>
                        <label for="cartao" class="pagamento-label">
                            <input required id="cartao" type="radio" name="pagamento" class="input-radio">
                            <div class="info-pagamento">
                                <p class="p-pagamento">Cartão</p>
                                <p class="p-info">Em caso de cancelamento do prestador, reembolso garantido.</p>
                            </div>
                        </label>
                        <p class="info-p">Ao realizar o agendamento, sera necessário esperar a aprovação do prestador.</p>
                    </div>
                </div>
            </div>
            <div>
                <div class="resumo-reserva">
                    <h3 id="titulo-resumo">Resumo da Reserva</h3>
                    <div class="serviço-resumo">
                        <p>Serviço:</p>
                        <p id="nome-servico">${servicoObj.nome}</p>
                    </div>
                    <div class="prestador-resumo">
                        <p>Profissional:</p>
                        <p id="nome-profissional">Lucas</p>
                    </div>
                    <div class="data-resumo">
                        <p>Data:</p>
                        <p id="nome-data">${data}</p>
                    </div>
                    <div class="horario-resumo">
                        <p>Horário:</p>
                        <p id="nome-horario">${h}:${m}</p>
                    </div>
                    <div class="confirmar-agendar">
                        <div class="total-container">
                            <h3 id="nome-total">Total:</h3>
                            <h3 id="nome-valor">R$ ${servicoObj.preco}</h3>
                        </div>
                        <input type="submit" value="Confirmar" class="btn-confirmar-agendar"></input>
                    <p class="p-confirmar">Ao clicar, você concorda com as  políticas de cancelamento.</p>
                    </div>
                </div>
            </div>
        </form>
    `
    div.innerHTML = html
    mainContainer.appendChild(div)
    const form = document.getElementById('confirmar-agendamento')
    form.addEventListener("submit", (event) => {
        event.preventDefault();
    });
    const btnAgendar = document.querySelector(".btn-confirmar-agendar")
    btnAgendar.addEventListener("click", () => {
    agendar(infoAgendamento);
    });
}
async function agendar(infoAgendamento){
    const metodoSelecionado = document.querySelector('input[name="pagamento"]:checked'); 
    if(metodoSelecionado) {
    const btnAgendar = document.querySelector(".btn-confirmar-agendar")
    btnAgendar.textContent = 'Processando...'
    const response = await fetch('http://localhost:8765/agendamentos',    {
        method: 'POST',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
        body: JSON.stringify(infoAgendamento)
    });
    if (!response.ok) {
        localStorage.removeItem('token_usuario')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        window.location.href = 'loginpage.html';  
    }
    const html = `
    <div id="agendamento-confirmado">
            <div id="agendamento-confirmado-container">
                <h3>Agendamento Confirmado!</h3>
                <p id="p-agendamento-confirmado">Aguarde mais instruções no seu Email!</p>
                <p>Obrigado!</p>
                <button id="btn-sair" class="btn-confirmar-agendar" onclick="sairPagamento()">Sair</button>
            </div>
        </div>
    `
    const aba = document.createElement("div")
    aba.innerHTML = html
    document.body.appendChild(aba)
    }
}
async function sairPagamento() {
    abaServico===true
    const aba = document.getElementById('agendamento-confirmado')
    aba.remove()
    iniciarAgendarServico()
}
function toLocalDateTimeString(data) {
    const pad = n => n.toString().padStart(2, '0')
    return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}` + `T${pad(data.getHours())}:${pad(data.getMinutes())}:${pad(data.getSeconds())}`
}
async function paginaTodosOsAgendamentos() {
    if(inicio.classList.contains('selected')){
        inicio.classList.remove('selected')  
        inicio.classList.add('list-item')
    }
    const agendamentos = await pegarAgendamentos(token)
    if(!meusAgendamentos.classList.contains('selected')){
    if(agendamentos.length >= 1) {
    const filterHtml = `
    <div id="agendamentos-filtro">
                        <ul class="nav-filter">
                            <li id="todos" class="filter-selected" onclick="filtroTodos()">Todos</li>
                            <li id="pendentes" class="filtro-item" onclick="filtroPendentes()">Pendentes</li>
                            <li id="aprovados" class="filtro-item" onclick="filtroAprovados()"">Aprovados</li>
                            <li id="rejeitados" class="filtro-item" onclick="filtroCancelados()">Cancelados</li>
                        </ul>
                    </div>
    `
         if(!agendarServico.classList.contains('selected')){
            const agendamentoContainer = document.querySelector(".agendamento-lista")
            agendamentoContainer.insertAdjacentHTML('afterbegin',filterHtml)
            const sugestionContainer = document.getElementById("sugestion-container")
            sugestionContainer.remove()
            const titulo = document.getElementById("titulo-agendamentos-futuros")
            titulo.innerHTML = ""
        }else{
            agendarServico.classList.remove('selected')
            agendarServico.classList.add('list-item')
            const agendamentoHtml= `
       <div id="agendamento-informations">
                <section class="agendamento-lista container">
                <div id="agendamentos-filtro">
                        <ul class="nav-filter">
                            <li id="todos" class="filter-selected" onclick="filtroTodos()">Todos</li>
                            <li id="pendentes" class="filtro-item" onclick="filtroPendentes()">Pendentes</li>
                            <li id="aprovados" class="filtro-item" onclick="filtroAprovados()"">Aprovados</li>
                            <li id="rejeitados" class="filtro-item" onclick="filtroCancelados()">Cancelados</li>
                        </ul>
                    </div>
                    <ul id="lista-agendamentos">
                        <li class="li-agendamento">
                            <div class="agendamento-box">
                                <div style="margin: auto;">
                                    <p class="nomeservico" style="font-size: medium; font-weight: 500;">Nenhum agendamento confirmado...</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
       ` 
            const informationContainer = document.getElementById("informations-container")
            informationContainer.innerHTML = agendamentoHtml
        }
    }else {
        if(!agendarServico.classList.contains('selected')){
            const sugestionContainer = document.getElementById("sugestion-container")
            sugestionContainer.remove()
            const titulo = document.getElementById("titulo-agendamentos-futuros")
            titulo.innerHTML = ""
        }else{
            agendarServico.classList.remove('selected')
            agendarServico.classList.add('list-item')
            const agendamentoHtml= `
       <div id="agendamento-informations">
                <section class="agendamento-lista container">
                    <ul id="lista-agendamentos">
                        <li class="li-agendamento">
                            <div class="agendamento-box">
                                <div style="margin: auto;">
                                    <p class="nomeservico" style="font-size: medium; font-weight: 500;">Nenhum agendamento confirmado...</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
       ` 
            const informationContainer = document.getElementById("informations-container")
            informationContainer.innerHTML = agendamentoHtml
    }
}
    meusAgendamentos.classList.remove('list-item');
    meusAgendamentos.classList.add('selected');

    const texto = document.querySelector(".nomeservico")
    texto.innerText = "Nenhum agendamento encontrado...";
    inicializarDashboardAgendamentos(agendamentos)
}
}
async function filtroTodos() {
    const lista = await pegarAgendamentos(token);
    const todos = document.getElementById("todos")
    const filtrosSelecionados = document.querySelectorAll('.filter-selected');
    filtrosSelecionados.forEach(filtro => {
        filtro.classList.remove('filter-selected');
        filtro.classList.add('filtro-item');
    });
    todos.classList.remove("filtro-item")
    todos.classList.add("filter-selected")
    inicializarDashboardAgendamentos(lista)
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
    inicializarDashboardAgendamentos(agendamentosPendentes)
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
    inicializarDashboardAgendamentos(agendamentosAgendados)
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
    inicializarDashboardAgendamentos(agendamentosCancelados)
    }
}
async function inicioStart(){
    if(!inicio.classList.contains('selected')){
        const informationContainer = document.getElementById("informations-container")
        if(!agendarServico.classList.contains('selected')){
            const agendamentoContainer = document.getElementById("agendamento-informations")
            agendamentoContainer.remove()
        }
        const html = `
                <div id="sugestion-container">
                <section class="agendamento-info">
                    <div class="container" id="novo-agendamento">
                        <h2 id="titulo-novo-agendamento">Quer um Novo Agendamento?</h2>
                        <p id="p-novo-agendamento">Encontre o serviço ideal e reserve seu horário em segundos.</p>
                        <button id="agendamentobtn" onclick="iniciarAgendarServico()">Agendar Novo Serviço (🎯)</button>
                    </div>
                    <div class="container" id="agendamento-pendente">
                        <h3 id="titulo-agendamento-pendente">Seus Agendamentos Pendentes</h3>
                        <div class="agendamento-container">
                            <div id="valor-agendamentos-pendentes">0</div>
                            <p id="agendamentospendentes">agendamentos aguardando aprovação</p>
                        </div>
                        <p id="ver-agendamentos" onclick="paginaTodosOsAgendamentos()">Ver todos os Agendamentos →</p>
                    </div>
                </section>
            </div>
        `

       const agendamentoHtml= `
       <div id="agendamento-informations">
                <section class="agendamento-lista container">
                    <h2 id="titulo-agendamentos-futuros">Próximos Agendamentos Futuros</h2>
                    <ul id="lista-agendamentos">
                        <li class="li-agendamento">
                            <div class="agendamento-box">
                                <div style="margin: auto;">
                                    <p class="nomeservico" style="font-size: medium; font-weight: 500;">Nenhum agendamento confirmado...</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
       ` 
        informationContainer.innerHTML = html
        informationContainer.innerHTML += agendamentoHtml
        inicio.classList.remove('list-item')
        inicio.classList.add('selected')
        if(agendarServico.classList.contains('selected')){
            agendarServico.classList.remove('selected')  
            agendarServico.classList.add('list-item')
        }
        if(meusAgendamentos.classList.contains('selected')){
            meusAgendamentos.classList.remove('selected')  
            meusAgendamentos.classList.add('list-item')
        }
        inicializarDashboardInicio(tipoUsuario, token);
    }
}

