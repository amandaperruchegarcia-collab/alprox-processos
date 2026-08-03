const CHAVE_STORAGE_CERTIFICADOS = 'alprox_certificados';

function carregarCertificados() {
  const dados = localStorage.getItem(CHAVE_STORAGE_CERTIFICADOS);
  return dados ? JSON.parse(dados) : [];
}

function salvarCertificados(lista) {
  localStorage.setItem(CHAVE_STORAGE_CERTIFICADOS, JSON.stringify(lista));
}

let certificados = carregarCertificados();

// ---------- Elementos ----------

const certificadoForm = document.getElementById('certificado-form');
const certificadoNovoBtn = document.getElementById('certificado-novo-btn');
const certificadoCancelarBtn = document.getElementById('certificado-cancelar-btn');
const certificadoListaEl = document.getElementById('certificado-lista');
const certificadoVazioEl = document.getElementById('certificado-vazio');
const certificadoBuscaEl = document.getElementById('certificado-busca');

const certificadoIdEl = document.getElementById('certificado-id');
const certificadoClienteEl = document.getElementById('certificado-cliente');
const certificadoTipoEl = document.getElementById('certificado-tipo');
const certificadoEmissaoEl = document.getElementById('certificado-emissao');
const certificadoValidadeEl = document.getElementById('certificado-validade');
const certificadoResponsavelEl = document.getElementById('certificado-responsavel');

function atualizarSelectResponsavelCertificado() {
  const valorAtual = certificadoResponsavelEl.value;
  certificadoResponsavelEl.innerHTML = '<option value="">Sem responsável definido</option>';
  listarColaboradoresAtuais().forEach(colab => {
    const opt = document.createElement('option');
    opt.value = colab.id;
    opt.textContent = colab.nome;
    certificadoResponsavelEl.appendChild(opt);
  });
  certificadoResponsavelEl.value = valorAtual;
}

// ---------- Form: abrir / fechar ----------

function abrirCertificadoFormNovo() {
  certificadoForm.reset();
  certificadoIdEl.value = '';
  atualizarSelectResponsavelCertificado();
  atualizarTodosSelectsDeCliente();
  certificadoForm.classList.remove('escondido');
  certificadoClienteEl.focus();
}

function abrirCertificadoFormEdicao(certificado) {
  atualizarSelectResponsavelCertificado();
  atualizarTodosSelectsDeCliente();
  certificadoIdEl.value = certificado.id;
  certificadoClienteEl.value = certificado.clienteId;
  certificadoTipoEl.value = certificado.tipo;
  certificadoEmissaoEl.value = certificado.emissao || '';
  certificadoValidadeEl.value = certificado.validade;
  certificadoResponsavelEl.value = certificado.responsavelId || '';
  certificadoForm.classList.remove('escondido');
  certificadoClienteEl.focus();
}

function fecharCertificadoForm() {
  certificadoForm.classList.add('escondido');
  certificadoForm.reset();
}

certificadoNovoBtn.addEventListener('click', abrirCertificadoFormNovo);
certificadoCancelarBtn.addEventListener('click', fecharCertificadoForm);

// ---------- Salvar (criar ou editar) ----------

certificadoForm.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const id = certificadoIdEl.value;

  if (id) {
    const certificado = certificados.find(c => c.id === id);
    certificado.clienteId = certificadoClienteEl.value;
    certificado.tipo = certificadoTipoEl.value;
    certificado.emissao = certificadoEmissaoEl.value;
    certificado.validade = certificadoValidadeEl.value;
    certificado.responsavelId = certificadoResponsavelEl.value;
  } else {
    certificados.push({
      id: Date.now().toString(),
      clienteId: certificadoClienteEl.value,
      tipo: certificadoTipoEl.value,
      emissao: certificadoEmissaoEl.value,
      validade: certificadoValidadeEl.value,
      responsavelId: certificadoResponsavelEl.value
    });
  }

  salvarCertificados(certificados);
  fecharCertificadoForm();
  renderizarCertificados();
});

// ---------- Ações ----------

function excluirCertificado(id) {
  const confirmou = confirm('Tem certeza que quer excluir este certificado?');
  if (!confirmou) return;
  certificados = certificados.filter(c => c.id !== id);
  salvarCertificados(certificados);
  renderizarCertificados();
}

// ---------- Renderização (reaproveita situacaoValidade e rotuloSituacao de certidoes.js) ----------

function criarCertificadoCard(certificado) {
  const situacao = situacaoValidade(certificado.validade);
  const card = document.createElement('div');
  card.className = 'processo-card' + (situacao === 'vencida' ? ' inativo' : '');

  const classeBadge = situacao === 'vencida' ? 'badge-vencida' : situacao === 'alerta' ? 'badge-alerta' : '';
  const responsavel = nomeResponsavelPrazo(certificado.responsavelId);

  card.innerHTML = `
    <div class="processo-topo">
      <p class="processo-nome">${escaparHtml(certificado.tipo)}</p>
      <span class="badge ${classeBadge}">${rotuloSituacao[situacao]}</span>
    </div>
    <div class="processo-meta">
      <span class="tarefa-cliente">🏢 ${escaparHtml(nomeCliente(certificado.clienteId) || 'Cliente removido')}</span>
      ${responsavel ? `<span class="tarefa-responsavel">👤 ${escaparHtml(responsavel)}</span>` : ''}
      ${certificado.emissao ? `<span>Emitido em ${formatarData(certificado.emissao)}</span>` : ''}
      <span>Validade: ${formatarData(certificado.validade)}</span>
    </div>
    <div class="processo-acoes">
      <button class="btn-link" data-acao="editar">Editar</button>
      <button class="btn-perigo" data-acao="excluir">Excluir</button>
    </div>
  `;

  card.querySelector('[data-acao="editar"]').addEventListener('click', () => abrirCertificadoFormEdicao(certificado));
  card.querySelector('[data-acao="excluir"]').addEventListener('click', () => excluirCertificado(certificado.id));

  return card;
}

function renderizarCertificados() {
  const termoBusca = certificadoBuscaEl.value.trim().toLowerCase();

  const filtrados = certificados.filter(c => {
    if (!termoBusca) return true;
    return (nomeCliente(c.clienteId) || '').toLowerCase().includes(termoBusca);
  });

  certificadoListaEl.innerHTML = '';

  if (filtrados.length === 0) {
    certificadoVazioEl.classList.remove('escondido');
    certificadoVazioEl.textContent = certificados.length === 0
      ? 'Nenhum certificado cadastrado ainda. Clique em "+ Novo certificado" pra começar.'
      : 'Nenhum certificado encontrado com esse filtro.';
  } else {
    certificadoVazioEl.classList.add('escondido');
    filtrados
      .slice()
      .sort((a, b) => a.validade.localeCompare(b.validade))
      .forEach(c => certificadoListaEl.appendChild(criarCertificadoCard(c)));
  }
}

certificadoBuscaEl.addEventListener('input', renderizarCertificados);

// ---------- Início ----------

renderizarCertificados();
