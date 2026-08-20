import { escaparHtml, formatarData } from './utils.js';

// Função para carregar prazos do Supabase
async function carregarPrazos() {
  try {
    if (!window.supabase || !window.supabase_usuario_id) {
      console.error('Supabase não inicializado ou usuário não logado');
      return [];
    }

    const { data, error } = await window.supabase
      .from('alprox_prazos')
      .select('*')
      .eq('usuario_id', window.supabase_usuario_id)
      .order('data_vencimento', { ascending: true });

    if (error) {
      console.error('Erro ao carregar prazos:', error);
      return [];
    }

    // Calcular status automaticamente: marcar como vencido se data < hoje e status = pendente
    const hoje = new Date().toISOString().split('T')[0];
    return (data || []).map(p => ({
      ...p,
      // Manter o status do banco, mas detectar vencimento
      _vencido: p.data_vencimento < hoje && p.status === 'pendente'
    }));
  } catch (error) {
    console.error('Erro ao carregar prazos:', error);
    return [];
  }
}

// Função para salvar novo prazo no Supabase
async function salvarPrazo(prazo) {
  try {
    if (!window.supabase || !window.supabase_usuario_id) {
      throw new Error('Supabase não inicializado ou usuário não logado');
    }

    const { error } = await window.supabase
      .from('alprox_prazos')
      .insert({
        usuario_id: window.supabase_usuario_id,
        titulo: prazo.titulo,
        cliente_id: prazo.clienteId || null,
        data_vencimento: prazo.vencimento,
        responsavel_id: prazo.responsavelId || null,
        status: prazo.status || 'pendente'
      });

    if (error) {
      console.error('Erro ao salvar prazo:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar prazo:', error);
    throw error;
  }
}

// Função para atualizar prazo no Supabase
async function atualizarPrazo(id, prazo) {
  try {
    if (!window.supabase) {
      throw new Error('Supabase não inicializado');
    }

    const { error } = await window.supabase
      .from('alprox_prazos')
      .update({
        titulo: prazo.titulo,
        cliente_id: prazo.clienteId || null,
        data_vencimento: prazo.vencimento,
        responsavel_id: prazo.responsavelId || null,
        status: prazo.status,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)
      .eq('usuario_id', window.supabase_usuario_id);

    if (error) {
      console.error('Erro ao atualizar prazo:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar prazo:', error);
    throw error;
  }
}

// Função para deletar prazo no Supabase
async function deletarPrazo(id) {
  try {
    if (!window.supabase) {
      throw new Error('Supabase não inicializado');
    }

    const { error } = await window.supabase
      .from('alprox_prazos')
      .delete()
      .eq('id', id)
      .eq('usuario_id', window.supabase_usuario_id);

    if (error) {
      console.error('Erro ao deletar prazo:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar prazo:', error);
    throw error;
  }
}

let prazos = [];

// ---------- Elementos ----------

const prazoForm = document.getElementById('prazo-form');
const prazoNovoBtn = document.getElementById('prazo-novo-btn');
const prazoCancelarBtn = document.getElementById('prazo-cancelar-btn');
const prazoListaEl = document.getElementById('prazo-lista');
const prazoVazioEl = document.getElementById('prazo-vazio');
const prazoMostrarCumpridosEl = document.getElementById('prazo-mostrar-cumpridos');

const prazoIdEl = document.getElementById('prazo-id');
const prazoTituloEl = document.getElementById('prazo-titulo');
const prazoClienteEl = document.getElementById('prazo-cliente');
const prazoVencimentoEl = document.getElementById('prazo-vencimento');
const prazoResponsavelEl = document.getElementById('prazo-responsavel');

function atualizarSelectResponsavelPrazo() {
  const valorAtual = prazoResponsavelEl.value;
  prazoResponsavelEl.innerHTML = '<option value="">Sem responsável definido</option>';
  listarColaboradoresAtuais().forEach(colab => {
    const opt = document.createElement('option');
    opt.value = colab.id;
    opt.textContent = colab.nome;
    prazoResponsavelEl.appendChild(opt);
  });
  prazoResponsavelEl.value = valorAtual;
}

// ---------- Form: abrir / fechar ----------

function abrirPrazoFormNovo() {
  prazoForm.reset();
  prazoIdEl.value = '';
  atualizarSelectResponsavelPrazo();
  atualizarTodosSelectsDeCliente();
  prazoForm.classList.remove('escondido');
  prazoTituloEl.focus();
}

function abrirPrazoFormEdicao(prazo) {
  atualizarSelectResponsavelPrazo();
  atualizarTodosSelectsDeCliente();
  prazoIdEl.value = prazo.id;
  prazoTituloEl.value = prazo.titulo;
  prazoClienteEl.value = prazo.cliente_id || '';
  prazoVencimentoEl.value = prazo.data_vencimento;
  prazoResponsavelEl.value = prazo.responsavel_id || '';
  prazoForm.classList.remove('escondido');
  prazoTituloEl.focus();
}

function fecharPrazoForm() {
  prazoForm.classList.add('escondido');
  prazoForm.reset();
}

prazoNovoBtn.addEventListener('click', abrirPrazoFormNovo);
prazoCancelarBtn.addEventListener('click', fecharPrazoForm);

// ---------- Salvar (criar ou editar) ----------

prazoForm.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  try {
    const id = prazoIdEl.value;

    if (id) {
      // Editar prazo existente
      const prazo = prazos.find(p => p.id === id);
      if (prazo) {
        await atualizarPrazo(id, {
          titulo: prazoTituloEl.value.trim(),
          clienteId: prazoClienteEl.value,
          vencimento: prazoVencimentoEl.value,
          responsavelId: prazoResponsavelEl.value,
          status: prazo.status
        });
      }
    } else {
      // Criar novo prazo
      await salvarPrazo({
        titulo: prazoTituloEl.value.trim(),
        clienteId: prazoClienteEl.value,
        vencimento: prazoVencimentoEl.value,
        responsavelId: prazoResponsavelEl.value,
        status: 'pendente'
      });
    }

    fecharPrazoForm();
    prazos = await carregarPrazos();
    renderizarPrazos();
  } catch (error) {
    console.error('Erro ao salvar prazo:', error);
    alert('Erro ao salvar prazo. Tente novamente.');
  }
});

// ---------- Ações ----------

async function alternarStatusPrazo(id) {
  try {
    const prazo = prazos.find(p => p.id === id);
    if (!prazo) return;

    const novoStatus = prazo.status === 'pendente' ? 'cumprido' : 'pendente';
    await atualizarPrazo(id, {
      titulo: prazo.titulo,
      clienteId: prazo.cliente_id,
      vencimento: prazo.data_vencimento,
      responsavelId: prazo.responsavel_id,
      status: novoStatus
    });

    prazos = await carregarPrazos();
    renderizarPrazos();
  } catch (error) {
    console.error('Erro ao alterar status do prazo:', error);
    alert('Erro ao alterar status. Tente novamente.');
  }
}

async function excluirPrazo(id) {
  const confirmou = confirm('Tem certeza que quer excluir este prazo?');
  if (!confirmou) return;

  try {
    await deletarPrazo(id);
    prazos = await carregarPrazos();
    renderizarPrazos();
  } catch (error) {
    console.error('Erro ao excluir prazo:', error);
    alert('Erro ao excluir prazo. Tente novamente.');
  }
}

// ---------- Renderização ----------

function prazoEstaAtrasado(prazo) {
  if (prazo.status === 'cumprido') return false;
  const hoje = new Date().toISOString().slice(0, 10);
  return prazo.data_vencimento < hoje;
}

function criarPrazoCard(prazo) {
  const atrasado = prazoEstaAtrasado(prazo);
  const card = document.createElement('div');
  card.className = `tarefa-card status-${prazo.status}` + (atrasado ? ' atrasada' : '');

  // Adicionar classe de alerta visual para prazos vencidos
  if (atrasado) {
    card.classList.add('alerta-vencimento');
  }

  const responsavel = nomeResponsavelPrazo(prazo.responsavel_id);
  const cliente = nomeCliente(prazo.cliente_id);

  card.innerHTML = `
    <div class="tarefa-topo">
      <p class="tarefa-titulo ${prazo.status === 'cumprido' ? 'riscado' : ''}">${escaparHtml(prazo.titulo)}</p>
    </div>
    <div class="processo-meta">
      ${cliente ? `<span class="tarefa-cliente">🏢 ${escaparHtml(cliente)}</span>` : ''}
      ${responsavel ? `<span class="tarefa-responsavel">👤 ${escaparHtml(responsavel)}</span>` : ''}
    </div>
    <span class="tarefa-prazo ${atrasado ? 'atrasada' : ''}">${atrasado ? '⚠ ' : ''}Vencimento: ${formatarData(prazo.data_vencimento)}</span>
    <div class="tarefa-acoes">
      <button class="btn-link" data-acao="alternar">${prazo.status === 'pendente' ? 'Marcar como cumprido' : 'Reabrir'}</button>
      <div class="tarefa-acoes-btns">
        <button class="btn-link" data-acao="editar">Editar</button>
        <button class="btn-perigo" data-acao="excluir">Excluir</button>
      </div>
    </div>
  `;

  card.querySelector('[data-acao="alternar"]').addEventListener('click', async () => await alternarStatusPrazo(prazo.id));
  card.querySelector('[data-acao="editar"]').addEventListener('click', () => abrirPrazoFormEdicao(prazo));
  card.querySelector('[data-acao="excluir"]').addEventListener('click', async () => await excluirPrazo(prazo.id));

  return card;
}

function renderizarPrazos() {
  const mostrarCumpridos = prazoMostrarCumpridosEl.checked;

  const filtrados = prazos.filter(p => mostrarCumpridos || p.status !== 'cumprido');

  prazoListaEl.innerHTML = '';

  if (filtrados.length === 0) {
    prazoVazioEl.classList.remove('escondido');
    prazoVazioEl.textContent = prazos.length === 0
      ? 'Nenhum prazo cadastrado ainda. Clique em "+ Novo prazo" pra começar.'
      : 'Nenhum prazo pendente. Marque "Mostrar cumpridos" pra ver os concluídos.';
  } else {
    prazoVazioEl.classList.add('escondido');
    filtrados
      .slice()
      .sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento))
      .forEach(prazo => prazoListaEl.appendChild(criarPrazoCard(prazo)));
  }
}

prazoMostrarCumpridosEl.addEventListener('change', renderizarPrazos);

// ---------- Início ----------

// Inicializar carregando dados do Supabase na primeira vez
async function inicializarPrazos() {
  prazos = await carregarPrazos();
  renderizarPrazos();
}

// Chamar inicialização quando o módulo estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarPrazos);
} else {
  inicializarPrazos();
}

// Também recarregar quando receber evento de login
window.addEventListener('usuario-logado', inicializarPrazos);
