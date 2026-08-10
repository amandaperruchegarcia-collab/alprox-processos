// Variáveis globais
let clientes = [];
let historicoMap = {}; // Mapeia cliente_id -> array de anotações
let historicoAbertoId = null;

/**
 * Obtém o ID do usuário autenticado
 * @returns {Promise<string>} ID do usuário
 */
async function obterUsuarioId() {
  try {
    const { data } = await window.supabase.auth.getSession();
    if (data?.session?.user?.id) {
      return data.session.user.id;
    }
    throw new Error('Usuário não autenticado');
  } catch (error) {
    console.error('Erro ao obter usuario_id:', error);
    throw new Error('Usuário não autenticado');
  }
}

/**
 * Carrega clientes do Supabase
 * @returns {Promise<Array>} Lista de clientes
 */
async function carregarClientes() {
  try {
    const { data, error } = await window.supabase
      .from('alprox_clientes')
      .select('*')
      .order('nome_empresa');

    if (error) {
      console.error('Erro ao carregar clientes:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
    return [];
  }
}

/**
 * Carrega histórico de um cliente do Supabase
 * @param {string} cliente_id - ID do cliente
 * @returns {Promise<Array>} Lista de anotações
 */
async function carregarHistorico(cliente_id) {
  try {
    const { data, error } = await window.supabase
      .from('alprox_historico_clientes')
      .select('*')
      .eq('cliente_id', cliente_id)
      .order('data', { ascending: false });

    if (error) {
      console.error('Erro ao carregar histórico:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    return [];
  }
}

/**
 * Salva um novo cliente no Supabase
 * @param {Object} cliente - Dados do cliente
 * @returns {Promise<Object>} Cliente criado
 */
async function salvarCliente(cliente) {
  try {
    const usuario_id = await obterUsuarioId();

    const { data, error } = await window.supabase
      .from('alprox_clientes')
      .insert({
        nome_empresa: cliente.nome || cliente.nomeEmpresa,
        cnpj: cliente.cnpj || '',
        contato: cliente.contato || '',
        responsavel: cliente.responsavelId || cliente.responsavel || '',
        observacoes: cliente.observacoes || '',
        criado_por: usuario_id
      })
      .select();

    if (error) {
      console.error('Erro ao salvar cliente:', error);
      throw error;
    }
    return data[0] || null;
  } catch (error) {
    console.error('Erro ao salvar cliente:', error);
    throw error;
  }
}

/**
 * Atualiza um cliente no Supabase
 * @param {string} id - ID do cliente
 * @param {Object} cliente - Dados atualizados
 * @returns {Promise<void>}
 */
async function atualizarCliente(id, cliente) {
  try {
    const { error } = await window.supabase
      .from('alprox_clientes')
      .update({
        nome_empresa: cliente.nome || cliente.nomeEmpresa,
        cnpj: cliente.cnpj || '',
        contato: cliente.contato || '',
        responsavel: cliente.responsavelId || cliente.responsavel || '',
        observacoes: cliente.observacoes || '',
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }
}

/**
 * Deleta um cliente no Supabase (cascata deleta histórico)
 * @param {string} id - ID do cliente
 * @returns {Promise<void>}
 */
async function deletarCliente(id) {
  try {
    const { error } = await window.supabase
      .from('alprox_clientes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    throw error;
  }
}

/**
 * Adiciona uma anotação ao histórico de um cliente
 * @param {string} cliente_id - ID do cliente
 * @param {string} anotacao - Texto da anotação
 * @param {string} data - Data (YYYY-MM-DD) - opcional, usa hoje por padrão
 * @returns {Promise<Object>} Anotação criada
 */
async function adicionarAnotacao(cliente_id, anotacao, data = null) {
  try {
    const usuario_id = await obterUsuarioId();

    const dataFormatada = data || new Date().toISOString().split('T')[0];

    const { data: resultado, error } = await window.supabase
      .from('alprox_historico_clientes')
      .insert({
        cliente_id: cliente_id,
        data: dataFormatada,
        anotacao: anotacao,
        criado_por: usuario_id
      })
      .select();

    if (error) {
      console.error('Erro ao adicionar anotação:', error);
      throw error;
    }
    return resultado[0] || null;
  } catch (error) {
    console.error('Erro ao adicionar anotação:', error);
    throw error;
  }
}

/**
 * Deleta uma anotação do histórico
 * @param {string} anotacao_id - ID da anotação
 * @returns {Promise<void>}
 */
async function deletarAnotacao(anotacao_id) {
  try {
    const { error } = await window.supabase
      .from('alprox_historico_clientes')
      .delete()
      .eq('id', anotacao_id);

    if (error) {
      console.error('Erro ao deletar anotação:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar anotação:', error);
    throw error;
  }
}

/**
 * Lista clientes atuais (versão compatível com código antigo)
 * @returns {Array} Lista de clientes
 */
function listarClientesAtuais() {
  return clientes;
}

/**
 * Obtem o nome de um cliente pelo ID
 * @param {string} clienteId - ID do cliente
 * @returns {string|null} Nome do cliente ou null
 */
function nomeCliente(clienteId) {
  if (!clienteId) return null;
  const cliente = clientes.find(c => c.id === clienteId);
  return cliente ? cliente.nome_empresa : null;
}

// ---------- Elementos ----------

const clienteForm = document.getElementById('cliente-form');
const clienteNovoBtn = document.getElementById('cliente-novo-btn');
const clienteCancelarBtn = document.getElementById('cliente-cancelar-btn');
const clienteListaEl = document.getElementById('cliente-lista');
const clienteVazioEl = document.getElementById('cliente-vazio');
const clienteBuscaEl = document.getElementById('cliente-busca');

const clienteIdEl = document.getElementById('cliente-id');
const clienteNomeEl = document.getElementById('cliente-nome');
const clienteCnpjEl = document.getElementById('cliente-cnpj');
const clienteContatoEl = document.getElementById('cliente-contato');
const clienteResponsavelEl = document.getElementById('cliente-responsavel');
const clienteObsEl = document.getElementById('cliente-obs');

function atualizarSelectResponsavelCliente() {
  const valorAtual = clienteResponsavelEl.value;
  clienteResponsavelEl.innerHTML = '<option value="">Sem responsável definido</option>';
  listarColaboradoresAtuais().forEach(colab => {
    const opt = document.createElement('option');
    opt.value = colab.id;
    opt.textContent = colab.nome;
    clienteResponsavelEl.appendChild(opt);
  });
  clienteResponsavelEl.value = valorAtual;
}

// ---------- Form: abrir / fechar ----------

function abrirClienteFormNovo() {
  clienteForm.reset();
  clienteIdEl.value = '';
  atualizarSelectResponsavelCliente();
  clienteForm.classList.remove('escondido');
  clienteNomeEl.focus();
}

function abrirClienteFormEdicao(cliente) {
  atualizarSelectResponsavelCliente();
  clienteIdEl.value = cliente.id;
  clienteNomeEl.value = cliente.nome_empresa || '';
  clienteCnpjEl.value = cliente.cnpj || '';
  clienteContatoEl.value = cliente.contato || '';
  clienteResponsavelEl.value = cliente.responsavel || '';
  clienteObsEl.value = cliente.observacoes || '';
  clienteForm.classList.remove('escondido');
  clienteNomeEl.focus();
}

function fecharClienteForm() {
  clienteForm.classList.add('escondido');
  clienteForm.reset();
}

clienteNovoBtn.addEventListener('click', abrirClienteFormNovo);
clienteCancelarBtn.addEventListener('click', fecharClienteForm);

// ---------- Salvar (criar ou editar) ----------

clienteForm.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  try {
    const id = clienteIdEl.value;
    const novoCliente = {
      nome: clienteNomeEl.value.trim(),
      nomeEmpresa: clienteNomeEl.value.trim(),
      cnpj: clienteCnpjEl.value.trim(),
      contato: clienteContatoEl.value.trim(),
      responsavelId: clienteResponsavelEl.value,
      observacoes: clienteObsEl.value.trim()
    };

    if (id) {
      // Editar cliente existente
      await atualizarCliente(id, novoCliente);
    } else {
      // Criar novo cliente
      await salvarCliente(novoCliente);
    }

    fecharClienteForm();
    await recarregarClientes();
    atualizarTodosSelectsDeCliente();
  } catch (error) {
    console.error('Erro ao salvar cliente:', error);
    alert('Erro ao salvar cliente: ' + error.message);
  }
});

// ---------- Ações ----------

async function excluirCliente(id) {
  const confirmou = confirm('Tem certeza que quer excluir este cliente? O histórico dele também será apagado.');
  if (!confirmou) return;

  try {
    await deletarCliente(id);
    await recarregarClientes();
    atualizarTodosSelectsDeCliente();
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    alert('Erro ao excluir cliente: ' + error.message);
  }
}

function alternarHistorico(id) {
  historicoAbertoId = historicoAbertoId === id ? null : id;
  renderizarClientes();
}

async function adicionarNotaHistorico(clienteId, data, texto) {
  if (!texto.trim()) return;

  try {
    await adicionarAnotacao(clienteId, texto.trim(), data);
    // Recarregar histórico deste cliente
    historicoMap[clienteId] = await carregarHistorico(clienteId);
    renderizarClientes();
  } catch (error) {
    console.error('Erro ao adicionar anotação:', error);
    alert('Erro ao adicionar anotação: ' + error.message);
  }
}

async function excluirNotaHistorico(clienteId, notaId) {
  try {
    await deletarAnotacao(notaId);
    // Recarregar histórico deste cliente
    historicoMap[clienteId] = await carregarHistorico(clienteId);
    renderizarClientes();
  } catch (error) {
    console.error('Erro ao deletar anotação:', error);
    alert('Erro ao deletar anotação: ' + error.message);
  }
}

// ---------- Renderização ----------

function criarClienteCard(cliente) {
  const card = document.createElement('div');
  card.className = 'processo-card';

  const responsavel = cliente.responsavel || '';
  const historico = historicoMap[cliente.id] || [];
  const historicoAberto = historicoAbertoId === cliente.id;

  card.innerHTML = `
    <div class="processo-topo">
      <p class="processo-nome">${escaparHtml(cliente.nome_empresa)}</p>
    </div>
    <div class="processo-meta">
      ${cliente.cnpj ? `<span>${escaparHtml(cliente.cnpj)}</span>` : ''}
      ${cliente.contato ? `<span>${escaparHtml(cliente.contato)}</span>` : ''}
      ${responsavel ? `<span class="tarefa-responsavel">👤 ${escaparHtml(responsavel)}</span>` : ''}
    </div>
    ${cliente.observacoes ? `<p class="processo-obs">${escaparHtml(cliente.observacoes)}</p>` : ''}
    <button type="button" class="btn-link historico-toggle" data-acao="toggle-historico">
      ${historicoAberto ? '▾' : '▸'} Histórico (${historico.length})
    </button>
    ${historicoAberto ? `
      <div class="historico-bloco">
        ${historico
          .slice()
          .sort((a, b) => b.data.localeCompare(a.data))
          .map(n => `
            <div class="historico-item">
              <span class="historico-data">${formatarData(n.data)}</span>
              <span class="historico-texto">${escaparHtml(n.anotacao)}</span>
              <button type="button" class="btn-perigo" data-acao="excluir-nota" data-nota-id="${n.id}" title="Excluir anotação">✕</button>
            </div>
          `).join('') || '<p class="processo-obs">Nenhuma anotação ainda.</p>'}
        <div class="historico-nova">
          <input type="date" data-campo="nova-data" value="${new Date().toISOString().slice(0, 10)}">
          <input type="text" data-campo="novo-texto" placeholder="O que aconteceu?">
          <button type="button" class="btn-secundario" data-acao="add-nota">Adicionar</button>
        </div>
      </div>
    ` : ''}
    <div class="processo-acoes">
      <button class="btn-link" data-acao="editar">Editar</button>
      <button class="btn-perigo" data-acao="excluir">Excluir</button>
    </div>
  `;

  card.querySelector('[data-acao="editar"]').addEventListener('click', () => abrirClienteFormEdicao(cliente));
  card.querySelector('[data-acao="excluir"]').addEventListener('click', () => excluirCliente(cliente.id));
  card.querySelector('[data-acao="toggle-historico"]').addEventListener('click', () => alternarHistorico(cliente.id));

  if (historicoAberto) {
    card.querySelectorAll('[data-acao="excluir-nota"]').forEach(btn => {
      btn.addEventListener('click', () => excluirNotaHistorico(cliente.id, btn.dataset.notaId));
    });
    const btnAdd = card.querySelector('[data-acao="add-nota"]');
    btnAdd.addEventListener('click', () => {
      const data = card.querySelector('[data-campo="nova-data"]').value;
      const texto = card.querySelector('[data-campo="novo-texto"]').value;
      adicionarNotaHistorico(cliente.id, data, texto);
    });
  }

  return card;
}

function renderizarClientes() {
  const termoBusca = clienteBuscaEl.value.trim().toLowerCase();

  const filtrados = clientes.filter(c => !termoBusca || c.nome_empresa.toLowerCase().includes(termoBusca));

  clienteListaEl.innerHTML = '';

  if (filtrados.length === 0) {
    clienteVazioEl.classList.remove('escondido');
    clienteVazioEl.textContent = clientes.length === 0
      ? 'Nenhum cliente cadastrado ainda. Clique em "+ Novo cliente" pra começar.'
      : 'Nenhum cliente encontrado com esse filtro.';
  } else {
    clienteVazioEl.classList.add('escondido');
    filtrados
      .slice()
      .sort((a, b) => a.nome_empresa.localeCompare(b.nome_empresa))
      .forEach(c => clienteListaEl.appendChild(criarClienteCard(c)));
  }
}

clienteBuscaEl.addEventListener('input', renderizarClientes);

// ---------- Recarregar dados ----------

/**
 * Recarrega clientes e seu histórico do Supabase
 * @returns {Promise<void>}
 */
async function recarregarClientes() {
  try {
    clientes = await carregarClientes();

    // Carregar histórico para cada cliente
    for (const cliente of clientes) {
      historicoMap[cliente.id] = await carregarHistorico(cliente.id);
    }

    renderizarClientes();
  } catch (error) {
    console.error('Erro ao recarregar clientes:', error);
  }
}

// ---------- Atualiza selects de cliente em Prazos, Certidões e Certificados ----------

function atualizarTodosSelectsDeCliente() {
  document.querySelectorAll('[data-select-cliente]').forEach(select => {
    const valorAtual = select.value;
    const primeiraOpcao = select.querySelector('option');
    if (!primeiraOpcao) return; // Segurança: verifica se existe primeira opção

    const primeiraOpcaoHTML = primeiraOpcao.outerHTML;
    select.innerHTML = primeiraOpcaoHTML;
    clientes.forEach(cliente => {
      const opt = document.createElement('option');
      opt.value = cliente.id;
      opt.textContent = cliente.nome_empresa;
      select.appendChild(opt);
    });
    select.value = valorAtual;
  });
}

// ---------- Início ----------

// Inicializar dados quando o módulo é carregado
(async () => {
  try {
    await recarregarClientes();
    atualizarTodosSelectsDeCliente();
  } catch (error) {
    console.error('Erro ao inicializar clientes:', error);
  }
})();
