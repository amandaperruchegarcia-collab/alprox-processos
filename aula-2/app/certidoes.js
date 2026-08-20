import { escaparHtml, formatarData } from './utils.js';

const DIAS_ALERTA_VENCIMENTO = 30;

// Variable para armazenar certidões em memória (carregadas do Supabase)
let certidoes = [];

/**
 * Calcula o status de uma certidão baseado na data de validade
 * @param {string} dataValidade - data em formato YYYY-MM-DD
 * @returns {string} 'vencida' | 'válida'
 */
function calcularStatusCertidao(dataValidade) {
  const hoje = new Date().toISOString().split('T')[0];
  return dataValidade < hoje ? 'vencida' : 'válida';
}

/**
 * Carrega certidões do Supabase
 * @returns {Promise<Array>} Array de certidões
 */
async function carregarCertidoes() {
  try {
    const { data, error } = await window.supabase
      .from('alprox_certidoes')
      .select('*')
      .eq('usuario_id', window.supabase_usuario_id);

    if (error) {
      console.error('Erro ao carregar certidões:', error);
      return [];
    }

    // Enriquecer com status calculado
    const certidoesComStatus = (data || []).map(c => ({
      ...c,
      status: calcularStatusCertidao(c.data_validade)
    }));

    return certidoesComStatus;
  } catch (error) {
    console.error('Erro ao carregar certidões:', error);
    return [];
  }
}

/**
 * Salva uma nova certidão no Supabase
 * @param {Object} certidao - Dados da certidão
 * @returns {Promise<Object>} Certidão criada
 */
async function salvarCertidao(certidao) {
  try {
    const status = calcularStatusCertidao(certidao.data_validade);

    const { data, error } = await window.supabase
      .from('alprox_certidoes')
      .insert({
        usuario_id: window.supabase_usuario_id,
        cliente_id: certidao.cliente_id || null,
        tipo: certidao.tipo,
        data_emissao: certidao.data_emissao,
        data_validade: certidao.data_validade,
        status: status
      })
      .select();

    if (error) {
      console.error('Erro ao salvar certidão:', error);
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error('Erro ao salvar certidão:', error);
    throw error;
  }
}

/**
 * Atualiza uma certidão existente
 * @param {string} id - ID da certidão
 * @param {Object} certidao - Dados da certidão
 * @returns {Promise<void>}
 */
async function atualizarCertidao(id, certidao) {
  try {
    const status = calcularStatusCertidao(certidao.data_validade);

    const { error } = await window.supabase
      .from('alprox_certidoes')
      .update({
        cliente_id: certidao.cliente_id || null,
        tipo: certidao.tipo,
        data_emissao: certidao.data_emissao,
        data_validade: certidao.data_validade,
        status: status,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar certidão:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar certidão:', error);
    throw error;
  }
}

/**
 * Deleta uma certidão
 * @param {string} id - ID da certidão
 * @returns {Promise<void>}
 */
async function deletarCertidao(id) {
  try {
    const { error } = await window.supabase
      .from('alprox_certidoes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar certidão:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar certidão:', error);
    throw error;
  }
}

// ---------- Elementos ----------

const certidaoForm = document.getElementById('certidao-form');
const certidaoNovoBtn = document.getElementById('certidao-novo-btn');
const certidaoCancelarBtn = document.getElementById('certidao-cancelar-btn');
const certidaoListaEl = document.getElementById('certidao-lista');
const certidaoVazioEl = document.getElementById('certidao-vazio');
const certidaoBuscaEl = document.getElementById('certidao-busca');

const certidaoIdEl = document.getElementById('certidao-id');
const certidaoClienteEl = document.getElementById('certidao-cliente');
const certidaoTipoEl = document.getElementById('certidao-tipo');
const certidaoEmissaoEl = document.getElementById('certidao-emissao');
const certidaoValidadeEl = document.getElementById('certidao-validade');

// ---------- Form: abrir / fechar ----------

function abrirCertidaoFormNovo() {
  certidaoForm.reset();
  certidaoIdEl.value = '';
  atualizarTodosSelectsDeCliente();
  certidaoForm.classList.remove('escondido');
  certidaoClienteEl.focus();
}

function abrirCertidaoFormEdicao(certidao) {
  atualizarTodosSelectsDeCliente();
  certidaoIdEl.value = certidao.id;
  certidaoClienteEl.value = certidao.cliente_id || '';
  certidaoTipoEl.value = certidao.tipo;
  certidaoEmissaoEl.value = certidao.data_emissao || '';
  certidaoValidadeEl.value = certidao.data_validade;
  certidaoForm.classList.remove('escondido');
  certidaoClienteEl.focus();
}

function fecharCertidaoForm() {
  certidaoForm.classList.add('escondido');
  certidaoForm.reset();
}

certidaoNovoBtn.addEventListener('click', abrirCertidaoFormNovo);
certidaoCancelarBtn.addEventListener('click', fecharCertidaoForm);

// ---------- Salvar (criar ou editar) ----------

certidaoForm.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  try {
    const id = certidaoIdEl.value;
    const novasCertidoes = {
      cliente_id: certidaoClienteEl.value || null,
      tipo: certidaoTipoEl.value.trim(),
      data_emissao: certidaoEmissaoEl.value,
      data_validade: certidaoValidadeEl.value
    };

    if (id) {
      // Editar
      await atualizarCertidao(id, novasCertidoes);
    } else {
      // Criar
      await salvarCertidao(novasCertidoes);
    }

    fecharCertidaoForm();
    await atualizarListaCertidoes();
  } catch (error) {
    console.error('Erro ao salvar certidão:', error);
    alert('Erro ao salvar certidão. Tente novamente.');
  }
});

// ---------- Ações ----------

async function excluirCertidaoConfirmado(id) {
  const confirmou = confirm('Tem certeza que quer excluir esta certidão?');
  if (!confirmou) return;

  try {
    await deletarCertidao(id);
    await atualizarListaCertidoes();
  } catch (error) {
    console.error('Erro ao excluir certidão:', error);
    alert('Erro ao excluir certidão. Tente novamente.');
  }
}

// ---------- Cálculo de status ----------

function situacaoValidade(dataValidade) {
  const hoje = new Date().toISOString().slice(0, 10);
  const diasRestantes = Math.floor((new Date(dataValidade) - new Date(hoje)) / 86400000);

  if (diasRestantes < 0) return 'vencida';
  if (diasRestantes <= DIAS_ALERTA_VENCIMENTO) return 'alerta';
  return 'valida';
}

const rotuloSituacao = {
  vencida: 'Vencida',
  alerta: 'Vence em breve',
  valida: 'Válida'
};

// ---------- Renderização ----------

function criarCertidaoCard(certidao) {
  const situacao = situacaoValidade(certidao.data_validade);
  const card = document.createElement('div');

  // Aplicar classe .alerta-vencimento para vencidas (cor dourada)
  const classes = ['processo-card'];
  if (situacao === 'vencida') {
    classes.push('inativo', 'alerta-vencimento');
  }
  card.className = classes.join(' ');

  const classeBadge = situacao === 'vencida' ? 'badge-vencida' : situacao === 'alerta' ? 'badge-alerta' : '';

  card.innerHTML = `
    <div class="processo-topo">
      <p class="processo-nome">${escaparHtml(certidao.tipo)}</p>
      <span class="badge ${classeBadge}">${rotuloSituacao[situacao]}</span>
    </div>
    <div class="processo-meta">
      <span class="tarefa-cliente">🏢 ${escaparHtml(nomeCliente(certidao.cliente_id) || 'Cliente removido')}</span>
      ${certidao.data_emissao ? `<span>Emitida em ${formatarData(certidao.data_emissao)}</span>` : ''}
      <span>Validade: ${formatarData(certidao.data_validade)}</span>
    </div>
    <div class="processo-acoes">
      <button class="btn-link" data-acao="editar">Editar</button>
      <button class="btn-perigo" data-acao="excluir">Excluir</button>
    </div>
  `;

  card.querySelector('[data-acao="editar"]').addEventListener('click', () => abrirCertidaoFormEdicao(certidao));
  card.querySelector('[data-acao="excluir"]').addEventListener('click', () => excluirCertidaoConfirmado(certidao.id));

  return card;
}

function renderizarCertidoes() {
  const termoBusca = certidaoBuscaEl.value.trim().toLowerCase();

  const filtradas = certidoes.filter(c => {
    if (!termoBusca) return true;
    const nomeDoCliente = (nomeCliente(c.cliente_id) || '').toLowerCase();
    return nomeDoCliente.includes(termoBusca) || c.tipo.toLowerCase().includes(termoBusca);
  });

  certidaoListaEl.innerHTML = '';

  if (filtradas.length === 0) {
    certidaoVazioEl.classList.remove('escondido');
    certidaoVazioEl.textContent = certidoes.length === 0
      ? 'Nenhuma certidão cadastrada ainda. Clique em "+ Nova certidão" pra começar.'
      : 'Nenhuma certidão encontrada com esse filtro.';
  } else {
    certidaoVazioEl.classList.add('escondido');
    filtradas
      .slice()
      .sort((a, b) => a.data_validade.localeCompare(b.data_validade))
      .forEach(c => certidaoListaEl.appendChild(criarCertidaoCard(c)));
  }
}

/**
 * Atualiza a lista de certidões carregando do Supabase e renderizando
 */
async function atualizarListaCertidoes() {
  certidoes = await carregarCertidoes();
  renderizarCertidoes();
}

certidaoBuscaEl.addEventListener('input', renderizarCertidoes);

// ---------- Início ----------

// Carregar certidões ao inicializar
async function inicializarCertidoes() {
  if (!window.supabase_usuario_id) {
    console.warn('Aguardando autenticação...');
    return;
  }
  certidoes = await carregarCertidoes();
  renderizarCertidoes();
}

// IMPORTANTE: Apenas carregar dados APÓS autenticação
// Não chamar imediatamente no startup para evitar erros de usuario_id nulo
window.addEventListener('usuario-logado', inicializarCertidoes);
