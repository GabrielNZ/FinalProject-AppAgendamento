const token = localStorage.getItem('token');
const tituloInfo = document.getElementById('usuario-infos')

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
        localStorage.removeItem('token')
        window.location.href = 'loginpage.html';
    }
}

    const inicio = document.getElementById("inicio")
    const agendarServico = document.getElementById("agendar")
    const meusAgendamentos = document.getElementById("agendamentos-usuario")
    

    inicio.classList.add('selected');
    inicio.innerHTML += " 🎯";
    
    agendarServico.addEventListener('mouseover', () => {
    agendarServico.classList.add('hover-effect');
    });

    agendarServico.addEventListener('mouseout', () => {
    agendarServico.classList.remove('hover-effect');
    });

    meusAgendamentos.addEventListener('mouseover', () => {
    meusAgendamentos.classList.add('hover-effect');
    });

    meusAgendamentos.addEventListener('mouseout', () => {
    meusAgendamentos.classList.remove('hover-effect');
    });

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
        localStorage.removeItem('token')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.color = "#d63232ff";
        //window.location.href = 'loginpage.html';  
    }
const usuarioJson = await response.json();
tituloInfo.textContent = tipoUsuario+": "+usuarioJson.nome
const agendamentos = await pegarAgendamentos(token)

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
        localStorage.removeItem('token')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.colcor = "#d63232ff";
        //window.location.href = 'loginpage.html';  
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
    localStorage.removeItem('token')
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
        localStorage.removeItem('token')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.colcor = "#d63232ff";
        //window.location.href = 'loginpage.html';  
    }
    const servico = await responseServico.json();
    const responsePrestador = await fetch('http://localhost:8765/usuarios/'+agendamento.prestadorId,    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!responsePrestador.ok) {
        localStorage.removeItem('token')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.colcor = "#d63232ff";
        //window.location.href = 'loginpage.html';  
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
        inicio.innerHTML = inicio.innerHTML.substring(0, 6)
        inicio.classList.remove('selected')  

        inicio.addEventListener('mouseover', () => {
        inicio.classList.add('hover-effect');
        });

        inicio.addEventListener('mouseout', () => {
        inicio.classList.remove('hover-effect');
        });
    }
    if(meusAgendamentos.classList.contains('selected')){
            meusAgendamentos.innerHTML = meusAgendamentos.innerHTML.substring(0, 17)
            meusAgendamentos.classList.remove('selected')  

            meusAgendamentos.addEventListener('mouseover', () => {
            meusAgendamentos.classList.add('hover-effect');
            });

            meusAgendamentos.addEventListener('mouseout', () => {
            meusAgendamentos.classList.remove('hover-effect');
            });
    }
    if(!agendarServico.classList.contains('selected')){
        agendarServico.innerHTML += " 🎯"
    }
    agendarServico.classList.add('selected');

    agendarServico.addEventListener('mouseover', () => {
    agendarServico.classList.remove('hover-effect');
    });
    const informationContainer = document.getElementById("informations-container")
    informationContainer.innerHTML = `<p style="color: rgb(75 85 99); font-size: 1.125rem;margin-bottom: 1.5rem;">Escolha o serviço desejado para ver a disponibilidade do prestador.</p>`

    const response = await fetch('http://localhost:8765/servicos',    {
        method: 'GET',
        headers: { 
           'Content-Type': 'application/json', 'Authorization': token,
        },
    });
    if (!response.ok) {
        localStorage.removeItem('token')
        tituloInfo.textContent = 'Error'
        tituloInfo.style.colcor = "#d63232ff";
        //window.location.href = 'loginpage.html';  
    }
    const listaServicos = await response.json();

    for(const servico of listaServicos) {
        const response = await fetch('http://localhost:8765/usuarios/'+servico.prestador_id,    {
        method: 'GET',
        headers: { 
        'Content-Type': 'application/json', 'Authorization': token,
        },
        });
        if  (!response.ok) {
            localStorage.removeItem('token')
            tituloInfo.textContent = 'Error'
            tituloInfo.style.colcor = "#d63232ff";
            //window.location.href = 'loginpage.html'; 
        }
        const prestador = await response.json();
        const htmlServico = `
     <div class="servico-box">
                        <div class="servico-container">
                            <div>
                                <h3 class="nome-novo-servico">${servico.nome}</h3>
                                <p class="nome-novo-prestador">Prestador: <spam class="nome-prestador">${prestador.nome}</spam></p>
                                <div class="container-tempo-valor">
                                    <svg class="icon-time" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <p class="duracao">${servico.duracaoMinutos}min</p>
                                    <p class="valor">R$ ${servico.preco}</p>
                                </div>
                            </div>
                            <div>
                                <button class="agendar-btn">Agendar Agora</button>
                            </div>
                        </div>
                    </div>
    `
    informationContainer.innerHTML += htmlServico
    }
}
async function paginaTodosOsAgendamentos() {
    if(inicio.classList.contains('selected')){
        inicio.innerHTML = inicio.innerHTML.substring(0, 6)
        inicio.classList.remove('selected')  

        inicio.addEventListener('mouseover', () => {
        inicio.classList.add('hover-effect');
        });

        inicio.addEventListener('mouseout', () => {
        inicio.classList.remove('hover-effect');
        });
    }
    if(agendarServico.classList.contains('selected')){
        agendarServico.innerHTML = agendarServico.innerHTML.substring(0, 15)

        agendarServico.addEventListener('mouseover', () => {
        agendarServico.classList.add('hover-effect');
        });

        agendarServico.addEventListener('mouseout', () => {
        agendarServico.classList.remove('hover-effect');
        });
    }
    if(!meusAgendamentos.classList.contains('selected')){
        meusAgendamentos.innerHTML += " 🎯"
    }
    

    meusAgendamentos.addEventListener('mouseover', () => {
    meusAgendamentos.classList.remove('hover-effect');
    });
    const agendamentos = await pegarAgendamentos(token);
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
            const agendamentoContainer = document.querySelector(".agendamento-lista");
            agendamentoContainer.insertAdjacentHTML('afterbegin',filterHtml)
            const sugestionContainer = document.getElementById("sugestion-container")
            sugestionContainer.remove()
            const titulo = document.getElementById("titulo-agendamentos-futuros");
            titulo.innerHTML = ""
        }else{
            agendarServico.classList.remove('selected')
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
    }
    meusAgendamentos.classList.add('selected');
    
    const pendentes = document.getElementById("pendentes")
    const aprovados = document.getElementById("aprovados")
    const rejeitados = document.getElementById("rejeitados")

    pendentes.addEventListener('mouseover', () => {
    pendentes.classList.add('hover-effect-filter');
    });

    pendentes.addEventListener('mouseout', () => {
    pendentes.classList.remove('hover-effect-filter');
    });
    aprovados.addEventListener('mouseover', () => {
    aprovados.classList.add('hover-effect-filter');
    });

    aprovados.addEventListener('mouseout', () => {
    aprovados.classList.remove('hover-effect-filter');
    });
    rejeitados.addEventListener('mouseover', () => {
    rejeitados.classList.add('hover-effect-filter');
    });

    rejeitados.addEventListener('mouseout', () => {
    rejeitados.classList.remove('hover-effect-filter');
    });

    const texto = document.querySelector(".nomeservico")
    texto.innerText = "Nenhum agendamento encontrado...";
    inicializarDashboardAgendamentos(agendamentos)
}
}
async function filtroTodos() {
    const lista = await pegarAgendamentos(token);
    const todos = document.getElementById("todos")
    const pendentes = document.getElementById("pendentes")
    const aprovados = document.getElementById("aprovados")
    const rejeitados = document.getElementById("rejeitados")
    todos.classList.remove("filtro-item")
    todos.classList.add("filter-selected")
    if(aprovados.classList.contains('filter-selected')){
        aprovados.classList.remove('filter-selected')
        aprovados.classList.add('filtro-item')  

        aprovados.addEventListener('mouseover', () => {
        aprovados.classList.add('hover-effect-filter');
        });

        aprovados.addEventListener('mouseout', () => {
        aprovados.classList.remove('hover-effect-filter');
        });
    }
    if(pendentes.classList.contains('filter-selected')){
        pendentes.classList.remove('filter-selected')  
        pendentes.classList.add('filtro-item')  

        pendentes.addEventListener('mouseover', () => {
        pendentes.classList.add('hover-effect-filter');
        });

        pendentes.addEventListener('mouseout', () => {
        pendentes.classList.remove('hover-effect-filter');
        });
    }
    if(rejeitados.classList.contains('filter-selected')){
        rejeitados.classList.remove('filter-selected')
        rejeitados.classList.add('filtro-item')    

        rejeitados.addEventListener('mouseover', () => {
        rejeitados.classList.add('hover-effect-filter');
        });

        rejeitados.addEventListener('mouseout', () => {
        rejeitados.classList.remove('hover-effect-filter');
        });
    }
    inicializarDashboardAgendamentos(lista)
}
async function filtroPendentes() {
    const lista = await pegarAgendamentos(token);
    const agendamentosPendentes = lista.filter(a => a.status === "PENDENTE");
    const todos = document.getElementById("todos")
    const pendentes = document.getElementById("pendentes")
    const aprovados = document.getElementById("aprovados")
    const rejeitados = document.getElementById("rejeitados")
    pendentes.classList.remove("filtro-item")
    pendentes.classList.add("filter-selected")
    pendentes.addEventListener('mouseover', () => {
    pendentes.classList.remove('hover-effect-filter');
    });
    if(aprovados.classList.contains('filter-selected')){
        aprovados.classList.remove('filter-selected')
        aprovados.classList.add('filtro-item')  

        aprovados.addEventListener('mouseover', () => {
        aprovados.classList.add('hover-effect-filter');
        });

        aprovados.addEventListener('mouseout', () => {
        aprovados.classList.remove('hover-effect-filter');
        });
    }
    if(todos.classList.contains('filter-selected')){
        todos.classList.remove('filter-selected')  
        todos.classList.add('filtro-item')  

        todos.addEventListener('mouseover', () => {
        todos.classList.add('hover-effect-filter');
        });

        todos.addEventListener('mouseout', () => {
        todos.classList.remove('hover-effect-filter');
        });
    }
    if(rejeitados.classList.contains('filter-selected')){
        rejeitados.classList.remove('filter-selected')
        rejeitados.classList.add('filtro-item')    

        rejeitados.addEventListener('mouseover', () => {
        rejeitados.classList.add('hover-effect-filter');
        });

        rejeitados.addEventListener('mouseout', () => {
        rejeitados.classList.remove('hover-effect-filter');
        });
    }
    inicializarDashboardAgendamentos(agendamentosPendentes)
}
async function filtroAprovados() {
    const lista = await pegarAgendamentos(token);
    const agendamentosAgendados = lista.filter(a => a.status === "AGENDADO");
    const todos = document.getElementById("todos")
    const pendentes = document.getElementById("pendentes")
    const aprovados = document.getElementById("aprovados")
    const rejeitados = document.getElementById("rejeitados")
    aprovados.classList.remove("filtro-item")
    aprovados.classList.add("filter-selected")
    aprovados.addEventListener('mouseover', () => {
    aprovados.classList.remove('hover-effect-filter');
    });
    if(todos.classList.contains('filter-selected')){
        todos.classList.remove('filter-selected')
        todos.classList.add('filtro-item')  

        todos.addEventListener('mouseover', () => {
        todos.classList.add('hover-effect-filter');
        });

        todos.addEventListener('mouseout', () => {
        todos.classList.remove('hover-effect-filter');
        });
    }
    if(pendentes.classList.contains('filter-selected')){
        pendentes.classList.remove('filter-selected')  
        pendentes.classList.add('filtro-item')  

        pendentes.addEventListener('mouseover', () => {
        pendentes.classList.add('hover-effect-filter');
        });

        pendentes.addEventListener('mouseout', () => {
        pendentes.classList.remove('hover-effect-filter');
        });
    }
    if(rejeitados.classList.contains('filter-selected')){
        rejeitados.classList.remove('filter-selected')
        rejeitados.classList.add('filtro-item')    

        rejeitados.addEventListener('mouseover', () => {
        rejeitados.classList.add('hover-effect-filter');
        });

        rejeitados.addEventListener('mouseout', () => {
        rejeitados.classList.remove('hover-effect-filter');
        });
    }
    inicializarDashboardAgendamentos(agendamentosAgendados)
}
async function filtroCancelados() {
    const lista = await pegarAgendamentos(token);
    const agendamentosCancelados = lista.filter(a => a.status === "RECUSADO" || a.status === "CANCELADO" || a.status === "FALTOU");
    const todos = document.getElementById("todos")
    const pendentes = document.getElementById("pendentes")
    const aprovados = document.getElementById("aprovados")
    const rejeitados = document.getElementById("rejeitados")
    rejeitados.classList.remove("filtro-item")
    rejeitados.classList.add("filter-selected")
    rejeitados.addEventListener('mouseover', () => {
    rejeitados.classList.remove('hover-effect-filter');
    });
    if(todos.classList.contains('filter-selected')){
        todos.classList.remove('filter-selected')
        todos.classList.add('filtro-item')  

        todos.addEventListener('mouseover', () => {
        todos.classList.add('hover-effect-filter');
        });

        todos.addEventListener('mouseout', () => {
        todos.classList.remove('hover-effect-filter');
        });
    }
    if(pendentes.classList.contains('filter-selected')){
        pendentes.classList.remove('filter-selected')  
        pendentes.classList.add('filtro-item')  

        pendentes.addEventListener('mouseover', () => {
        pendentes.classList.add('hover-effect-filter');
        });

        pendentes.addEventListener('mouseout', () => {
        pendentes.classList.remove('hover-effect-filter');
        });
    }
    if(aprovados.classList.contains('filter-selected')){
        aprovados.classList.remove('filter-selected')
        aprovados.classList.add('filtro-item')    

        aprovados.addEventListener('mouseover', () => {
        aprovados.classList.add('hover-effect-filter');
        });

        aprovados.addEventListener('mouseout', () => {
        aprovados.classList.remove('hover-effect-filter');
        });
    }
    inicializarDashboardAgendamentos(agendamentosCancelados)
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
                        <button id="agendamentobtn">Agendar Novo Serviço (🎯)</button>
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
        inicio.classList.add('selected')
        inicio.innerHTML += " 🎯"
        if(agendarServico.classList.contains('selected')){
            agendarServico.innerHTML = agendarServico.innerHTML.substring(0, 15)
            agendarServico.classList.remove('selected')  

            agendarServico.addEventListener('mouseover', () => {
            agendarServico.classList.add('hover-effect');
            });

            agendarServico.addEventListener('mouseout', () => {
            agendarServico.classList.remove('hover-effect');
            });
        }
        if(meusAgendamentos.classList.contains('selected')){
            meusAgendamentos.innerHTML = meusAgendamentos.innerHTML.substring(0, 17)
            meusAgendamentos.classList.remove('selected')  

            meusAgendamentos.addEventListener('mouseover', () => {
            meusAgendamentos.classList.add('hover-effect');
            });

            meusAgendamentos.addEventListener('mouseout', () => {
            meusAgendamentos.classList.remove('hover-effect');
            });
        }
        inicializarDashboardInicio(tipoUsuario, token);
    }
}
