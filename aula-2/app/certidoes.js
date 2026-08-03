const CHAVE_STORAGE_CERTIDOES = 'alprox_certidoes';
const DIAS_ALERTA_VENCIMENTO = 30;

function carregarCertidoes() {
  const dados = localStorage.getItem(CHAVE_STORAGE_CERTIDOES);
  return dados ? JSON.parse(dados) : [];
}

function salvarCertidoes(lista) {
  localStorage.setItem(CHAVE_STORAGE_CERTIDOES, JSON.stringify(lista));
}

let certidoes = carregarCertidoes();

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
  certidaoClienteEl.value = certidao.clienteId;
  certidaoTipoEl.value = certidao.tipo;
  certidaoEmissaoEl.value = certidao.emissao || '';
  certidaoValidadeEl.value = certidao.validade;
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

certidaoForm.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const id = certidaoIdEl.value;

  if (id) {
    const certidao = certidoes.find(c => c.id === id);
    certidao.clienteId = certidaoClienteEl.value;
    certidao.tipo = certidaoTipoEl.value.trim();
    certidao.emissao = certidaoEmissaoEl.value;
    certidao.validade = certidaoValidadeEl.value;
  } else {
    certidoes.push({
      id: Date.now().toString(),
      clienteId: certidaoClienteEl.value,
      tipo: certidaoTipoEl.value.trim(),
      emissao: certidaoEmissaoEl.value,
      validade: certidaoValidadeEl.value
    });
  }

  salvarCertidoes(certidoes);
  fecharCertidaoForm();
  renderizarCertidoes();
});

// ---------- Ações ----------

function excluirCertidao(id) {
  const confirmou = confirm('Tem certeza que quer excluir esta certidão?');
  if (!confirmou) return;
  certidoes = certidoes.filter(c => c.id !== id);
  salvarCertidoes(certidoes);
  renderizarCertidoes();
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
  const situacao = situacaoValidade(certidao.validade);
  const card = document.createElement('div');
  card.className = 'processo-card' + (situacao === 'vencida' ? ' inativo' : '');

  const classeBadge = situacao === 'vencida' ? 'badge-vencida' : situacao === 'alerta' ? 'badge-alerta' : '';

  card.innerHTML = `
    <div class="processo-topo">
      <p class="processo-nome">${escaparHtml(certidao.tipo)}</p>
      <span class="badge ${classeBadge}">${rotuloSituacao[situacao]}</span>
    </div>
    <div class="processo-meta">
      <span class="tarefa-cliente">🏢 ${escaparHtml(nomeCliente(certidao.clienteId) || 'Cliente removido')}</span>
      ${certidao.emissao ? `<span>Emitida em ${formatarData(certidao.emissao)}</span>` : ''}
      <span>Validade: ${formatarData(certidao.validade)}</span>
    </div>
    <div class="processo-acoes">
      <button class="btn-link" data-acao="editar">Editar</button>
      <button class="btn-perigo" data-acao="excluir">Excluir</button>
    </div>
  `;

  card.querySelector('[data-acao="editar"]').addEventListener('click', () => abrirCertidaoFormEdicao(certidao));
  card.querySelector('[data-acao="excluir"]').addEventListener('click', () => excluirCertidao(certidao.id));

  return card;
}

function renderizarCertidoes() {
  const termoBusca = certidaoBuscaEl.value.trim().toLowerCase();

  const filtradas = certidoes.filter(c => {
    if (!termoBusca) return true;
    const nomeDoCliente = (nomeCliente(c.clienteId) || '').toLowerCase();
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
      .sort((a, b) => a.validade.localeCompare(b.validade))
      .forEach(c => certidaoListaEl.appendChild(criarCertidaoCard(c)));
  }
}

certidaoBuscaEl.addEventListener('input', renderizarCertidoes);

// ---------- Início ----------

renderizarCertidoes();
