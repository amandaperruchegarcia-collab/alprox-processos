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

/**
 * Carrega dados de resumo do dashboard do Supabase
 * @returns {Promise<Object>} Objeto com contagens dos 8 cards
 */
async function carregarResumoDashboard() {
  try {
    const [processos, fluxos, minhasTarefas, tarefasEquipe, prazos, certidoes, certificados, clientes] = await Promise.all([
      supabase.from('processos').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
      supabase.from('fluxos').select('*', { count: 'exact', head: true }),
      supabase.from('alprox_tarefas_pessoais').select('*').eq('usuario_id', window.supabase_usuario_id),
      supabase.from('alprox_tarefas_equipe').select('*').or(`criado_por.eq.${window.supabase_usuario_id},atribuido_para.eq.${window.supabase_usuario_id}`),
      supabase.from('prazos').select('*').eq('usuario_id', window.supabase_usuario_id),
      supabase.from('certidoes').select('*').eq('usuario_id', window.supabase_usuario_id),
      supabase.from('certificados').select('*').eq('usuario_id', window.supabase_usuario_id),
      supabase.from('clientes').select('*', { count: 'exact', head: true })
    ]);

    const hoje = hojeISO();

    return {
      processosAtivos: processos.count || 0,
      fluxosCadastrados: fluxos.count || 0,
      minhasTarefasPendentes: (minhasTarefas.data || []).filter(t => t.status !== 'feito').length,
      tarefasEquipePendentes: (tarefasEquipe.data || []).filter(t => t.status !== 'feito').length,
      prazosVencidos: (prazos.data || []).filter(p => p.data_vencimento < hoje && p.status === 'pendente').length,
      certidulesVencidas: (certidoes.data || []).filter(c => c.data_validade < hoje).length,
      certificadosVencidos: (certificados.data || []).filter(c => c.data_validade < hoje).length,
      clientesCadastrados: clientes.count || 0
    };
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    return {};
  }
}

async function renderizarCards() {
  const resumo = await carregarResumoDashboard();

  dashCardsEl.innerHTML = '';
  dashCardsEl.appendChild(criarCard(resumo.processosAtivos || 0, 'Processos ativos', () => mudarTela('tela-processos')));
  dashCardsEl.appendChild(criarCard(resumo.fluxosCadastrados || 0, 'Fluxos cadastrados', () => mudarTela('tela-fluxos')));
  dashCardsEl.appendChild(criarCard(resumo.minhasTarefasPendentes || 0, 'Minhas tarefas pendentes', () => mudarTela('tela-minhas-tarefas')));
  dashCardsEl.appendChild(criarCard(resumo.tarefasEquipePendentes || 0, 'Tarefas da equipe pendentes', () => mudarTela('tela-tarefas-equipe')));
  dashCardsEl.appendChild(criarCard(resumo.prazosVencidos || 0, 'Prazos vencidos', () => mudarTela('tela-prazos'), (resumo.prazosVencidos || 0) > 0));
  dashCardsEl.appendChild(criarCard(resumo.certidulesVencidas || 0, 'Certidões vencidas', () => mudarTela('tela-certidoes'), (resumo.certidulesVencidas || 0) > 0));
  dashCardsEl.appendChild(criarCard(resumo.certificadosVencidos || 0, 'Certificados vencidos', () => mudarTela('tela-certificados'), (resumo.certificadosVencidos || 0) > 0));
  dashCardsEl.appendChild(criarCard(resumo.clientesCadastrados || 0, 'Clientes cadastrados', () => mudarTela('tela-clientes')));
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

/**
 * Carrega eventos do mês especificado do Supabase
 * @param {number} ano - Ano (ex: 2025)
 * @param {number} mes - Mês (1-12)
 * @returns {Promise<Object>} Mapa {data: [eventos]} para o mês
 */
async function carregarEventosDoMes(ano, mes) {
  try {
    // Calcular intervalo do mês
    const inicioDoPeriodo = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const fimDoPeriodo = new Date(ano, mes, 0).toISOString().split('T')[0];

    // Buscar dados em paralelo
    const [prazos, tarefasPessoais, tarefasEquipe, certidoes, certificados, clientes] = await Promise.all([
      supabase.from('alprox_prazos')
        .select('*')
        .eq('usuario_id', window.supabase_usuario_id)
        .gte('data_vencimento', inicioDoPeriodo)
        .lte('data_vencimento', fimDoPeriodo)
        .eq('status', 'pendente'),

      supabase.from('alprox_tarefas_pessoais')
        .select('*')
        .eq('usuario_id', window.supabase_usuario_id)
        .gte('prazo', inicioDoPeriodo)
        .lte('prazo', fimDoPeriodo)
        .neq('status', 'feito'),

      supabase.from('alprox_tarefas_equipe')
        .select('*')
        .or(`criado_por.eq.${window.supabase_usuario_id},atribuido_para.eq.${window.supabase_usuario_id}`)
        .gte('prazo', inicioDoPeriodo)
        .lte('prazo', fimDoPeriodo)
        .neq('status', 'feito'),

      supabase.from('alprox_certidoes')
        .select('*')
        .eq('usuario_id', window.supabase_usuario_id)
        .gte('data_validade', inicioDoPeriodo)
        .lte('data_validade', fimDoPeriodo),

      supabase.from('alprox_certificados')
        .select('*')
        .eq('usuario_id', window.supabase_usuario_id)
        .gte('data_validade', inicioDoPeriodo)
        .lte('data_validade', fimDoPeriodo),

      supabase.from('clientes').select('id, nome_empresa')
    ]);

    // Mapa de clientes pra consulta rápida
    const clientesMap = {};
    (clientes.data || []).forEach(c => {
      clientesMap[c.id] = c.nome_empresa;
    });

    const eventos = [];

    // Prazos
    (prazos.data || []).forEach(p => {
      if (!p.data_vencimento) return;
      const nomeCliente = p.cliente_id ? clientesMap[p.cliente_id] : '';
      eventos.push({
        data: p.data_vencimento,
        titulo: p.titulo + (nomeCliente ? ` · ${nomeCliente}` : ''),
        tipo: 'Prazo',
        cor: 'dourado',
        tela: 'tela-prazos'
      });
    });

    // Tarefas pessoais
    (tarefasPessoais.data || []).forEach(t => {
      if (!t.prazo) return;
      eventos.push({
        data: t.prazo,
        titulo: t.titulo,
        tipo: 'Minha tarefa',
        cor: 'vermelho',
        tela: 'tela-minhas-tarefas'
      });
    });

    // Tarefas da equipe
    (tarefasEquipe.data || []).forEach(t => {
      if (!t.prazo) return;
      eventos.push({
        data: t.prazo,
        titulo: t.titulo,
        tipo: 'Tarefa da equipe',
        cor: 'vermelho',
        tela: 'tela-tarefas-equipe'
      });
    });

    // Certidões
    (certidoes.data || []).forEach(c => {
      if (!c.data_validade) return;
      const nomeCliente = c.cliente_id ? clientesMap[c.cliente_id] : '';
      eventos.push({
        data: c.data_validade,
        titulo: `${c.tipo}${nomeCliente ? ` · ${nomeCliente}` : ''}`,
        tipo: 'Certidão',
        cor: 'verde',
        tela: 'tela-certidoes'
      });
    });

    // Certificados
    (certificados.data || []).forEach(c => {
      if (!c.data_validade) return;
      const nomeCliente = c.cliente_id ? clientesMap[c.cliente_id] : '';
      eventos.push({
        data: c.data_validade,
        titulo: `${c.tipo}${nomeCliente ? ` · ${nomeCliente}` : ''}`,
        tipo: 'Certificado',
        cor: 'verde',
        tela: 'tela-certificados'
      });
    });

    // Agrupar eventos por dia
    const diasComEventos = {};
    eventos.forEach(ev => {
      if (!diasComEventos[ev.data]) {
        diasComEventos[ev.data] = [];
      }
      diasComEventos[ev.data].push(ev);
    });

    return diasComEventos;
  } catch (error) {
    console.error('Erro ao carregar eventos do mês:', error);
    return {};
  }
}

async function renderizarCalendario() {
  const nomeMes = NOMES_MES[mesAtual];
  dashMesTituloEl.textContent = `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} de ${anoAtual}`;

  dashCalendarioDiasEl.innerHTML = NOMES_DIA_SEMANA.map(d => `<span>${d}</span>`).join('');

  // Carregar eventos do Supabase
  const eventosPorDia = await carregarEventosDoMes(anoAtual, mesAtual + 1);

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

    celula.addEventListener('click', async () => {
      diaSelecionado = dataISO;
      await renderizarCalendario();
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

dashMesAnteriorEl.addEventListener('click', async () => {
  mesAtual--;
  if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
  diaSelecionado = null;
  await renderizarCalendario();
});

dashMesSeguinteEl.addEventListener('click', async () => {
  mesAtual++;
  if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
  diaSelecionado = null;
  await renderizarCalendario();
});

// ---------- Início ----------

async function inicializarDashboard() {
  await renderizarCards();
  await renderizarCalendario();
}

// Se usuario_id já existe (já autenticado), carregar dashboard
if (window.supabase_usuario_id) {
  inicializarDashboard();
}

// Listener para quando usuário fizer login
window.addEventListener('usuario-logado', () => {
  inicializarDashboard();
});

// Listener para recarregar dashboard quando dados mudam
window.addEventListener('dados-atualizados', () => {
  inicializarDashboard();
});
