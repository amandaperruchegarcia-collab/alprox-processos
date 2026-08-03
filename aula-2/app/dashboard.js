function lerStorage(chave) {
  const dados = localStorage.getItem(chave);
  return dados ? JSON.parse(dados) : [];
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

// ---------- Cards de resumo ----------

const dashCardsEl = document.getElementById('dash-cards');

function criarCard(numero, label, aoClicar, alerta) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dash-card';
  btn.innerHTML = `
    <span class="dash-card-numero${alerta ? ' alerta' : ''}">${numero}</span>
    <span class="dash-card-label">${label}</span>
  `;
  btn.addEventListener('click', aoClicar);
  return btn;
}

function renderizarCards() {
  const processos = lerStorage('alprox_processos');
  const minhasTarefas = lerStorage('alprox_minhas_tarefas');
  const tarefasEquipe = lerStorage('alprox_tarefas_equipe');
  const prazos = lerStorage('alprox_prazos');
  const certidoes = lerStorage('alprox_certidoes');
  const certificados = lerStorage('alprox_certificados');
  const clientes = lerStorage('alprox_clientes');
  const fluxos = lerStorage('alprox_fluxos');

  const hoje = hojeISO();

  const processosAtivos = processos.filter(p => p.status !== 'inativo').length;
  const minhasPendentes = minhasTarefas.filter(t => t.status !== 'feito').length;
  const equipePendentes = tarefasEquipe.filter(t => t.status !== 'feito').length;
  const prazosVencidos = prazos.filter(p => p.status !== 'cumprido' && p.vencimento < hoje).length;
  const certidoesVencidas = certidoes.filter(c => c.validade < hoje).length;
  const certificadosVencidos = certificados.filter(c => c.validade < hoje).length;

  dashCardsEl.innerHTML = '';
  dashCardsEl.appendChild(criarCard(processosAtivos, 'Processos ativos', () => mudarTela('tela-processos')));
  dashCardsEl.appendChild(criarCard(fluxos.length, 'Fluxos cadastrados', () => mudarTela('tela-fluxos')));
  dashCardsEl.appendChild(criarCard(minhasPendentes, 'Minhas tarefas pendentes', () => mudarTela('tela-minhas-tarefas')));
  dashCardsEl.appendChild(criarCard(equipePendentes, 'Tarefas da equipe pendentes', () => mudarTela('tela-tarefas-equipe')));
  dashCardsEl.appendChild(criarCard(prazosVencidos, 'Prazos vencidos', () => mudarTela('tela-prazos'), prazosVencidos > 0));
  dashCardsEl.appendChild(criarCard(certidoesVencidas, 'Certidões vencidas', () => mudarTela('tela-certidoes'), certidoesVencidas > 0));
  dashCardsEl.appendChild(criarCard(certificadosVencidos, 'Certificados vencidos', () => mudarTela('tela-certificados'), certificadosVencidos > 0));
  dashCardsEl.appendChild(criarCard(clientes.length, 'Clientes cadastrados', () => mudarTela('tela-clientes')));
}

// ---------- Calendário ----------

const dashMesTituloEl = document.getElementById('dash-mes-titulo');
const dashMesAnteriorEl = document.getElementById('dash-mes-anterior');
const dashMesSeguinteEl = document.getElementById('dash-mes-seguinte');
const dashCalendarioDiasEl = document.getElementById('dash-calendario-dias');
const dashCalendarioGradeEl = document.getElementById('dash-calendario-grade');
const dashDiaSelecionadoEl = document.getElementById('dash-dia-selecionado');

const NOMES_MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const NOMES_DIA_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

const hojeData = new Date();
let mesAtual = hojeData.getMonth();
let anoAtual = hojeData.getFullYear();
let diaSelecionado = null;

function coletarEventosDoMes() {
  const prazos = lerStorage('alprox_prazos');
  const certidoes = lerStorage('alprox_certidoes');
  const certificados = lerStorage('alprox_certificados');
  const minhasTarefas = lerStorage('alprox_minhas_tarefas');
  const tarefasEquipe = lerStorage('alprox_tarefas_equipe');
  const clientes = lerStorage('alprox_clientes');

  const nomeCliente = (id) => (clientes.find(c => c.id === id) || {}).nome || '';

  const eventos = [];

  prazos.forEach(p => {
    if (!p.vencimento || p.status === 'cumprido') return;
    eventos.push({ data: p.vencimento, titulo: p.titulo + (nomeCliente(p.clienteId) ? ` · ${nomeCliente(p.clienteId)}` : ''), tipo: 'Prazo', cor: 'dourado', tela: 'tela-prazos' });
  });

  certidoes.forEach(c => {
    if (!c.validade) return;
    eventos.push({ data: c.validade, titulo: `${c.tipo} · ${nomeCliente(c.clienteId)}`, tipo: 'Certidão', cor: 'verde', tela: 'tela-certidoes' });
  });

  certificados.forEach(c => {
    if (!c.validade) return;
    eventos.push({ data: c.validade, titulo: `${c.tipo} · ${nomeCliente(c.clienteId)}`, tipo: 'Certificado', cor: 'verde', tela: 'tela-certificados' });
  });

  minhasTarefas.forEach(t => {
    if (!t.prazo || t.status === 'feito') return;
    eventos.push({ data: t.prazo, titulo: t.titulo, tipo: 'Minha tarefa', cor: 'vermelho', tela: 'tela-minhas-tarefas' });
  });

  tarefasEquipe.forEach(t => {
    if (!t.prazo || t.status === 'feito') return;
    eventos.push({ data: t.prazo, titulo: t.titulo, tipo: 'Tarefa da equipe', cor: 'vermelho', tela: 'tela-tarefas-equipe' });
  });

  return eventos;
}

function renderizarCalendario() {
  const nomeMes = NOMES_MES[mesAtual];
  dashMesTituloEl.textContent = `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} de ${anoAtual}`;

  dashCalendarioDiasEl.innerHTML = NOMES_DIA_SEMANA.map(d => `<span>${d}</span>`).join('');

  const eventos = coletarEventosDoMes();
  const eventosPorDia = {};
  eventos.forEach(ev => {
    if (!eventosPorDia[ev.data]) eventosPorDia[ev.data] = [];
    eventosPorDia[ev.data].push(ev);
  });

  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();
  const totalDias = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const hoje = hojeISO();

  dashCalendarioGradeEl.innerHTML = '';

  for (let i = 0; i < primeiroDiaSemana; i++) {
    const vazio = document.createElement('div');
    vazio.className = 'dash-dia vazio';
    dashCalendarioGradeEl.appendChild(vazio);
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const dataISO = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const celula = document.createElement('div');
    celula.className = 'dash-dia' + (dataISO === hoje ? ' hoje' : '') + (dataISO === diaSelecionado ? ' selecionado' : '');

    const numero = document.createElement('span');
    numero.className = 'dash-dia-numero';
    numero.textContent = dia;
    celula.appendChild(numero);

    const eventosDoDia = eventosPorDia[dataISO] || [];
    if (eventosDoDia.length > 0) {
      const pontos = document.createElement('div');
      pontos.className = 'dash-dia-pontos';
      eventosDoDia.slice(0, 4).forEach(ev => {
        const ponto = document.createElement('span');
        ponto.className = `dash-ponto ${ev.cor}`;
        pontos.appendChild(ponto);
      });
      celula.appendChild(pontos);
    }

    celula.addEventListener('click', () => {
      diaSelecionado = dataISO;
      renderizarCalendario();
    });

    dashCalendarioGradeEl.appendChild(celula);
  }

  renderizarDiaSelecionado(eventosPorDia);
}

function formatarDataLonga(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

function renderizarDiaSelecionado(eventosPorDia) {
  dashDiaSelecionadoEl.innerHTML = '';
  if (!diaSelecionado) return;

  const eventosDoDia = eventosPorDia[diaSelecionado] || [];

  const titulo = document.createElement('p');
  titulo.className = 'dash-dia-selecionado-titulo';
  titulo.textContent = `${formatarDataLonga(diaSelecionado)} — ${eventosDoDia.length === 0 ? 'nada por aqui' : eventosDoDia.length + ' item(ns)'}`;
  dashDiaSelecionadoEl.appendChild(titulo);

  eventosDoDia.forEach(ev => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'dash-evento-item';
    item.innerHTML = `<span>${escaparHtml(ev.titulo)}</span><span class="dash-evento-tipo ${ev.cor}">${ev.tipo}</span>`;
    item.addEventListener('click', () => mudarTela(ev.tela));
    dashDiaSelecionadoEl.appendChild(item);
  });
}

dashMesAnteriorEl.addEventListener('click', () => {
  mesAtual--;
  if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
  diaSelecionado = null;
  renderizarCalendario();
});

dashMesSeguinteEl.addEventListener('click', () => {
  mesAtual++;
  if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
  diaSelecionado = null;
  renderizarCalendario();
});

// ---------- Início ----------

renderizarCards();
renderizarCalendario();
