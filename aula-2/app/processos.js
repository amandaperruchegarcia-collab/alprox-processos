const DEPARTAMENTOS = [
  'Administrativo',
  'Contábil',
  'Societário',
  'Departamento Pessoal',
  'Fiscal',
  'Processos',
  'Treinamento'
];

const CHAVE_STORAGE = 'alprox_processos';

function carregarProcessos() {
  const dados = localStorage.getItem(CHAVE_STORAGE);
  return dados ? JSON.parse(dados) : [];
}

function salvarProcessos(lista) {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
}

let processos = carregarProcessos();

// ---------- Elementos ----------

const form = document.getElementById('proc-form');
const novoBtn = document.getElementById('proc-novo-btn');
const cancelarBtn = document.getElementById('proc-cancelar-btn');
const listaEl = document.getElementById('proc-lista');
const vazioEl = document.getElementById('proc-vazio');
const buscaEl = document.getElementById('proc-busca');
const filtroDeptoEl = document.getElementById('proc-filtro-depto');
const mostrarInativosEl = document.getElementById('proc-mostrar-inativos');

const idEl = document.getElementById('proc-id');
const nomeEl = document.getElementById('proc-nome');
const deptoEl = document.getElementById('proc-depto');
const codigoEl = document.getElementById('proc-codigo');
const driveEl = document.getElementById('proc-drive');
const youtubeEl = document.getElementById('proc-youtube');
const obsEl = document.getElementById('proc-obs');

// ---------- Preenche os selects de departamento ----------

function preencherSelectsDepartamento() {
  DEPARTAMENTOS.forEach(depto => {
    const optForm = document.createElement('option');
    optForm.value = depto;
    optForm.textContent = depto;
    deptoEl.appendChild(optForm);

    const optFiltro = document.createElement('option');
    optFiltro.value = depto;
    optFiltro.textContent = depto;
    filtroDeptoEl.appendChild(optFiltro);
  });
}

// ---------- Form: abrir / fechar / resetar ----------

function abrirFormNovo() {
  form.reset();
  idEl.value = '';
  form.classList.remove('escondido');
  nomeEl.focus();
}

function abrirFormEdicao(processo) {
  idEl.value = processo.id;
  nomeEl.value = processo.nome;
  deptoEl.value = processo.departamento;
  codigoEl.value = processo.codigo || '';
  driveEl.value = processo.linkDrive || '';
  youtubeEl.value = processo.linkYoutube || '';
  obsEl.value = processo.observacoes || '';
  form.classList.remove('escondido');
  nomeEl.focus();
}

function fecharForm() {
  form.classList.add('escondido');
  form.reset();
}

novoBtn.addEventListener('click', abrirFormNovo);
cancelarBtn.addEventListener('click', fecharForm);

// ---------- Salvar (criar ou editar) ----------

form.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const id = idEl.value;

  if (id) {
    const processo = processos.find(p => p.id === id);
    processo.nome = nomeEl.value.trim();
    processo.departamento = deptoEl.value;
    processo.codigo = codigoEl.value.trim();
    processo.linkDrive = driveEl.value.trim();
    processo.linkYoutube = youtubeEl.value.trim();
    processo.observacoes = obsEl.value.trim();
  } else {
    processos.push({
      id: Date.now().toString(),
      nome: nomeEl.value.trim(),
      departamento: deptoEl.value,
      codigo: codigoEl.value.trim(),
      linkDrive: driveEl.value.trim(),
      linkYoutube: youtubeEl.value.trim(),
      observacoes: obsEl.value.trim(),
      status: 'ativo'
    });
  }

  salvarProcessos(processos);
  fecharForm();
  renderizarLista();
});

// ---------- Ações da lista ----------

function alternarStatus(id) {
  const processo = processos.find(p => p.id === id);
  processo.status = processo.status === 'ativo' ? 'inativo' : 'ativo';
  salvarProcessos(processos);
  renderizarLista();
}

function excluirProcesso(id) {
  const confirmou = confirm('Tem certeza que quer excluir este processo? Essa ação não pode ser desfeita.');
  if (!confirmou) return;
  processos = processos.filter(p => p.id !== id);
  salvarProcessos(processos);
  renderizarLista();
}

// ---------- Renderização ----------

function criarCard(processo) {
  const card = document.createElement('div');
  card.className = 'processo-card' + (processo.status === 'inativo' ? ' inativo' : '');

  const links = [];
  if (ehUrlSegura(processo.linkDrive)) {
    links.push(`<a class="link-btn drive" href="${escaparHtml(processo.linkDrive)}" target="_blank" rel="noopener">📁 Abrir no Drive</a>`);
  }
  if (ehUrlSegura(processo.linkYoutube)) {
    links.push(`<a class="link-btn youtube" href="${escaparHtml(processo.linkYoutube)}" target="_blank" rel="noopener">▶️ Ver vídeo</a>`);
  }

  card.innerHTML = `
    <div class="processo-topo">
      <p class="processo-nome">${escaparHtml(processo.nome)}</p>
      <span class="badge ${processo.status === 'inativo' ? 'inativo' : ''}">${processo.status === 'inativo' ? 'Inativo' : 'Ativo'}</span>
    </div>
    <div class="processo-meta">
      <span class="badge">${escaparHtml(processo.departamento)}</span>
      ${processo.codigo ? `<span>${escaparHtml(processo.codigo)}</span>` : ''}
    </div>
    ${processo.observacoes ? `<p class="processo-obs">${escaparHtml(processo.observacoes)}</p>` : ''}
    ${links.length ? `<div class="processo-links">${links.join('')}</div>` : ''}
    <div class="processo-acoes">
      <button class="btn-link" data-acao="editar">Editar</button>
      <button class="btn-link" data-acao="alternar">${processo.status === 'ativo' ? 'Desativar' : 'Reativar'}</button>
      <button class="btn-perigo" data-acao="excluir">Excluir</button>
    </div>
  `;

  card.querySelector('[data-acao="editar"]').addEventListener('click', () => abrirFormEdicao(processo));
  card.querySelector('[data-acao="alternar"]').addEventListener('click', () => alternarStatus(processo.id));
  card.querySelector('[data-acao="excluir"]').addEventListener('click', () => excluirProcesso(processo.id));

  return card;
}

function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function ehUrlSegura(url) {
  if (!url) return false;
  try {
    const analisada = new URL(url);
    return analisada.protocol === 'http:' || analisada.protocol === 'https:';
  } catch {
    return false;
  }
}

function renderizarLista() {
  const termoBusca = buscaEl.value.trim().toLowerCase();
  const deptoFiltro = filtroDeptoEl.value;
  const mostrarInativos = mostrarInativosEl.checked;

  const filtrados = processos.filter(p => {
    if (!mostrarInativos && p.status === 'inativo') return false;
    if (deptoFiltro && p.departamento !== deptoFiltro) return false;
    if (termoBusca && !p.nome.toLowerCase().includes(termoBusca)) return false;
    return true;
  });

  listaEl.innerHTML = '';

  if (filtrados.length === 0) {
    vazioEl.classList.remove('escondido');
    vazioEl.textContent = processos.length === 0
      ? 'Nenhum processo cadastrado ainda. Clique em "+ Novo processo" pra começar.'
      : 'Nenhum processo encontrado com esse filtro.';
  } else {
    vazioEl.classList.add('escondido');
    filtrados.forEach(p => listaEl.appendChild(criarCard(p)));
  }
}

buscaEl.addEventListener('input', renderizarLista);
filtroDeptoEl.addEventListener('change', renderizarLista);
mostrarInativosEl.addEventListener('change', renderizarLista);

// ---------- Início ----------

preencherSelectsDepartamento();
renderizarLista();
