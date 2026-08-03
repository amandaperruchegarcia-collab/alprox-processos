const CHAVE_STORAGE_CLIENTES = 'alprox_clientes';

function carregarClientes() {
  const dados = localStorage.getItem(CHAVE_STORAGE_CLIENTES);
  return dados ? JSON.parse(dados) : [];
}

function salvarClientes(lista) {
  localStorage.setItem(CHAVE_STORAGE_CLIENTES, JSON.stringify(lista));
}

function listarClientesAtuais() {
  const dados = localStorage.getItem(CHAVE_STORAGE_CLIENTES);
  return dados ? JSON.parse(dados) : [];
}

function nomeCliente(clienteId) {
  if (!clienteId) return null;
  const cliente = listarClientesAtuais().find(c => c.id === clienteId);
  return cliente ? cliente.nome : null;
}

let clientes = carregarClientes();
let historicoAbertoId = null;

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
  clienteNomeEl.value = cliente.nome;
  clienteCnpjEl.value = cliente.cnpj || '';
  clienteContatoEl.value = cliente.contato || '';
  clienteResponsavelEl.value = cliente.responsavelId || '';
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

clienteForm.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const id = clienteIdEl.value;

  if (id) {
    const cliente = clientes.find(c => c.id === id);
    cliente.nome = clienteNomeEl.value.trim();
    cliente.cnpj = clienteCnpjEl.value.trim();
    cliente.contato = clienteContatoEl.value.trim();
    cliente.responsavelId = clienteResponsavelEl.value;
    cliente.observacoes = clienteObsEl.value.trim();
  } else {
    clientes.push({
      id: Date.now().toString(),
      nome: clienteNomeEl.value.trim(),
      cnpj: clienteCnpjEl.value.trim(),
      contato: clienteContatoEl.value.trim(),
      responsavelId: clienteResponsavelEl.value,
      observacoes: clienteObsEl.value.trim(),
      historico: []
    });
  }

  salvarClientes(clientes);
  fecharClienteForm();
  renderizarClientes();
  atualizarTodosSelectsDeCliente();
});

// ---------- Ações ----------

function excluirCliente(id) {
  const confirmou = confirm('Tem certeza que quer excluir este cliente? O histórico dele também será apagado.');
  if (!confirmou) return;
  clientes = clientes.filter(c => c.id !== id);
  salvarClientes(clientes);
  renderizarClientes();
  atualizarTodosSelectsDeCliente();
}

function alternarHistorico(id) {
  historicoAbertoId = historicoAbertoId === id ? null : id;
  renderizarClientes();
}

function adicionarNotaHistorico(clienteId, data, texto) {
  if (!texto.trim()) return;
  const cliente = clientes.find(c => c.id === clienteId);
  if (!cliente.historico) cliente.historico = [];
  cliente.historico.push({
    id: Date.now().toString(),
    data: data || new Date().toISOString().slice(0, 10),
    texto: texto.trim()
  });
  salvarClientes(clientes);
  renderizarClientes();
}

function excluirNotaHistorico(clienteId, notaId) {
  const cliente = clientes.find(c => c.id === clienteId);
  cliente.historico = cliente.historico.filter(n => n.id !== notaId);
  salvarClientes(clientes);
  renderizarClientes();
}

// ---------- Renderização ----------

function criarClienteCard(cliente) {
  const card = document.createElement('div');
  card.className = 'processo-card';

  const responsavel = nomeResponsavelPrazo(cliente.responsavelId);
  const historico = cliente.historico || [];
  const historicoAberto = historicoAbertoId === cliente.id;

  card.innerHTML = `
    <div class="processo-topo">
      <p class="processo-nome">${escaparHtml(cliente.nome)}</p>
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
              <span class="historico-texto">${escaparHtml(n.texto)}</span>
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

  const filtrados = clientes.filter(c => !termoBusca || c.nome.toLowerCase().includes(termoBusca));

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
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .forEach(c => clienteListaEl.appendChild(criarClienteCard(c)));
  }
}

clienteBuscaEl.addEventListener('input', renderizarClientes);

// ---------- Atualiza selects de cliente em Prazos, Certidões e Certificados ----------

function atualizarTodosSelectsDeCliente() {
  document.querySelectorAll('[data-select-cliente]').forEach(select => {
    const valorAtual = select.value;
    const primeiraOpcao = select.querySelector('option').outerHTML;
    select.innerHTML = primeiraOpcao;
    listarClientesAtuais().forEach(cliente => {
      const opt = document.createElement('option');
      opt.value = cliente.id;
      opt.textContent = cliente.nome;
      select.appendChild(opt);
    });
    select.value = valorAtual;
  });
}

// ---------- Início ----------

renderizarClientes();
atualizarTodosSelectsDeCliente();
