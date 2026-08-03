const CHAVE_STORAGE_PRAZOS = 'alprox_prazos';

function carregarPrazos() {
  const dados = localStorage.getItem(CHAVE_STORAGE_PRAZOS);
  return dados ? JSON.parse(dados) : [];
}

function salvarPrazos(lista) {
  localStorage.setItem(CHAVE_STORAGE_PRAZOS, JSON.stringify(lista));
}

let prazos = carregarPrazos();

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
  prazoClienteEl.value = prazo.clienteId || '';
  prazoVencimentoEl.value = prazo.vencimento;
  prazoResponsavelEl.value = prazo.responsavelId || '';
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

prazoForm.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const id = prazoIdEl.value;

  if (id) {
    const prazo = prazos.find(p => p.id === id);
    prazo.titulo = prazoTituloEl.value.trim();
    prazo.clienteId = prazoClienteEl.value;
    prazo.vencimento = prazoVencimentoEl.value;
    prazo.responsavelId = prazoResponsavelEl.value;
  } else {
    prazos.push({
      id: Date.now().toString(),
      titulo: prazoTituloEl.value.trim(),
      clienteId: prazoClienteEl.value,
      vencimento: prazoVencimentoEl.value,
      responsavelId: prazoResponsavelEl.value,
      status: 'pendente'
    });
  }

  salvarPrazos(prazos);
  fecharPrazoForm();
  renderizarPrazos();
});

// ---------- Ações ----------

function alternarStatusPrazo(id) {
  const prazo = prazos.find(p => p.id === id);
  prazo.status = prazo.status === 'pendente' ? 'cumprido' : 'pendente';
  salvarPrazos(prazos);
  renderizarPrazos();
}

function excluirPrazo(id) {
  const confirmou = confirm('Tem certeza que quer excluir este prazo?');
  if (!confirmou) return;
  prazos = prazos.filter(p => p.id !== id);
  salvarPrazos(prazos);
  renderizarPrazos();
}

// ---------- Renderização ----------

function prazoEstaAtrasado(prazo) {
  if (prazo.status === 'cumprido') return false;
  const hoje = new Date().toISOString().slice(0, 10);
  return prazo.vencimento < hoje;
}

function criarPrazoCard(prazo) {
  const atrasado = prazoEstaAtrasado(prazo);
  const card = document.createElement('div');
  card.className = `tarefa-card status-${prazo.status}` + (atrasado ? ' atrasada' : '');

  const responsavel = nomeResponsavelPrazo(prazo.responsavelId);
  const cliente = nomeCliente(prazo.clienteId);

  card.innerHTML = `
    <div class="tarefa-topo">
      <p class="tarefa-titulo ${prazo.status === 'cumprido' ? 'riscado' : ''}">${escaparHtml(prazo.titulo)}</p>
    </div>
    <div class="processo-meta">
      ${cliente ? `<span class="tarefa-cliente">🏢 ${escaparHtml(cliente)}</span>` : ''}
      ${responsavel ? `<span class="tarefa-responsavel">👤 ${escaparHtml(responsavel)}</span>` : ''}
    </div>
    <span class="tarefa-prazo ${atrasado ? 'atrasada' : ''}">${atrasado ? '⚠ ' : ''}Vencimento: ${formatarData(prazo.vencimento)}</span>
    <div class="tarefa-acoes">
      <button class="btn-link" data-acao="alternar">${prazo.status === 'pendente' ? 'Marcar como cumprido' : 'Reabrir'}</button>
      <div class="tarefa-acoes-btns">
        <button class="btn-link" data-acao="editar">Editar</button>
        <button class="btn-perigo" data-acao="excluir">Excluir</button>
      </div>
    </div>
  `;

  card.querySelector('[data-acao="alternar"]').addEventListener('click', () => alternarStatusPrazo(prazo.id));
  card.querySelector('[data-acao="editar"]').addEventListener('click', () => abrirPrazoFormEdicao(prazo));
  card.querySelector('[data-acao="excluir"]').addEventListener('click', () => excluirPrazo(prazo.id));

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
      .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
      .forEach(prazo => prazoListaEl.appendChild(criarPrazoCard(prazo)));
  }
}

prazoMostrarCumpridosEl.addEventListener('change', renderizarPrazos);

// ---------- Início ----------

renderizarPrazos();
