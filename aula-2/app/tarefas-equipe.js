const CHAVE_STORAGE_COLABORADORES = 'alprox_colaboradores';
const CHAVE_STORAGE_TAREFAS_EQUIPE = 'alprox_tarefas_equipe';

function carregarColaboradores() {
  const dados = localStorage.getItem(CHAVE_STORAGE_COLABORADORES);
  return dados ? JSON.parse(dados) : [];
}

function salvarColaboradores(lista) {
  localStorage.setItem(CHAVE_STORAGE_COLABORADORES, JSON.stringify(lista));
}

function carregarTarefasEquipe() {
  const dados = localStorage.getItem(CHAVE_STORAGE_TAREFAS_EQUIPE);
  return dados ? JSON.parse(dados) : [];
}

function salvarTarefasEquipe(lista) {
  localStorage.setItem(CHAVE_STORAGE_TAREFAS_EQUIPE, JSON.stringify(lista));
}

function listarColaboradoresAtuais() {
  const dados = localStorage.getItem(CHAVE_STORAGE_COLABORADORES);
  return dados ? JSON.parse(dados) : [];
}

function nomeResponsavelPrazo(responsavelId) {
  if (!responsavelId) return null;
  const colab = listarColaboradoresAtuais().find(c => c.id === responsavelId);
  return colab ? colab.nome : null;
}

let colaboradores = carregarColaboradores();
let tarefasEquipe = carregarTarefasEquipe();

// ---------- Elementos: colaboradores ----------

const colabForm = document.getElementById('colab-form');
const colabNovoBtn = document.getElementById('colab-novo-btn');
const colabCancelarBtn = document.getElementById('colab-cancelar-btn');
const colabListaEl = document.getElementById('colab-lista');
const colabVazioEl = document.getElementById('colab-vazio');
const colabNomeEl = document.getElementById('colab-nome');
const colabCargoEl = document.getElementById('colab-cargo');

colabNovoBtn.addEventListener('click', () => {
  colabForm.reset();
  colabForm.classList.remove('escondido');
  colabNomeEl.focus();
});

colabCancelarBtn.addEventListener('click', () => {
  colabForm.classList.add('escondido');
  colabForm.reset();
});

colabForm.addEventListener('submit', (evento) => {
  evento.preventDefault();
  colaboradores.push({
    id: Date.now().toString(),
    nome: colabNomeEl.value.trim(),
    cargo: colabCargoEl.value.trim()
  });
  salvarColaboradores(colaboradores);
  colabForm.classList.add('escondido');
  colabForm.reset();
  renderizarColaboradores();
  renderizarTarefasEquipe();
});

function excluirColaborador(id) {
  const confirmou = confirm('Excluir este colaborador? As tarefas já atribuídas a ele continuam na lista, só ficam sem responsável.');
  if (!confirmou) return;
  colaboradores = colaboradores.filter(c => c.id !== id);
  salvarColaboradores(colaboradores);
  renderizarColaboradores();
  renderizarTarefasEquipe();
}

function renderizarColaboradores() {
  colabListaEl.innerHTML = '';
  colabVazioEl.classList.toggle('escondido', colaboradores.length > 0);

  colaboradores.forEach(colab => {
    const chip = document.createElement('div');
    chip.className = 'colab-chip';
    chip.innerHTML = `
      <span>${escaparHtml(colab.nome)}${colab.cargo ? ` <span class="colab-cargo">· ${escaparHtml(colab.cargo)}</span>` : ''}</span>
      <button type="button" title="Excluir colaborador">✕</button>
    `;
    chip.querySelector('button').addEventListener('click', () => excluirColaborador(colab.id));
    colabListaEl.appendChild(chip);
  });

  atualizarSelectsResponsavel();
}

function atualizarSelectsResponsavel() {
  const selectFiltro = document.getElementById('tarefaequipe-filtro-responsavel');
  const selectForm = document.getElementById('tarefaequipe-responsavel');

  const valorFiltroAtual = selectFiltro.value;
  selectFiltro.innerHTML = '<option value="">Todos os responsáveis</option>';
  selectForm.innerHTML = '';

  colaboradores.forEach(colab => {
    const optFiltro = document.createElement('option');
    optFiltro.value = colab.id;
    optFiltro.textContent = colab.nome;
    selectFiltro.appendChild(optFiltro);

    const optForm = document.createElement('option');
    optForm.value = colab.id;
    optForm.textContent = colab.nome;
    selectForm.appendChild(optForm);
  });

  selectFiltro.value = valorFiltroAtual;
}

// ---------- Elementos: tarefas da equipe ----------

const tarefaEquipeForm = document.getElementById('tarefaequipe-form');
const tarefaEquipeNovoBtn = document.getElementById('tarefaequipe-novo-btn');
const tarefaEquipeCancelarBtn = document.getElementById('tarefaequipe-cancelar-btn');
const tarefaEquipeVazioEl = document.getElementById('tarefaequipe-vazio');
const tarefaEquipeFiltroResponsavelEl = document.getElementById('tarefaequipe-filtro-responsavel');
const colunasTarefasEquipeEl = document.querySelectorAll('#tela-tarefas-equipe .colunas-tarefas')[0];

const tarefaEquipeIdEl = document.getElementById('tarefaequipe-id');
const tarefaEquipeTituloEl = document.getElementById('tarefaequipe-titulo');
const tarefaEquipeResponsavelEl = document.getElementById('tarefaequipe-responsavel');
const tarefaEquipePrazoEl = document.getElementById('tarefaequipe-prazo');
const tarefaEquipeStatusEl = document.getElementById('tarefaequipe-status');
const tarefaEquipeDescEl = document.getElementById('tarefaequipe-desc');

const listasEquipePorStatus = {
  a_fazer: document.getElementById('tarefaequipe-lista-a_fazer'),
  fazendo: document.getElementById('tarefaequipe-lista-fazendo'),
  feito: document.getElementById('tarefaequipe-lista-feito')
};

function abrirTarefaEquipeFormNovo() {
  if (colaboradores.length === 0) {
    alert('Cadastre pelo menos um colaborador antes de criar uma tarefa da equipe.');
    return;
  }
  tarefaEquipeForm.reset();
  tarefaEquipeIdEl.value = '';
  tarefaEquipeForm.classList.remove('escondido');
  tarefaEquipeTituloEl.focus();
}

function abrirTarefaEquipeFormEdicao(tarefa) {
  tarefaEquipeIdEl.value = tarefa.id;
  tarefaEquipeTituloEl.value = tarefa.titulo;
  tarefaEquipeResponsavelEl.value = tarefa.responsavelId || '';
  tarefaEquipePrazoEl.value = tarefa.prazo || '';
  tarefaEquipeStatusEl.value = tarefa.status;
  tarefaEquipeDescEl.value = tarefa.descricao || '';
  tarefaEquipeForm.classList.remove('escondido');
  tarefaEquipeTituloEl.focus();
}

function fecharTarefaEquipeForm() {
  tarefaEquipeForm.classList.add('escondido');
  tarefaEquipeForm.reset();
}

tarefaEquipeNovoBtn.addEventListener('click', abrirTarefaEquipeFormNovo);
tarefaEquipeCancelarBtn.addEventListener('click', fecharTarefaEquipeForm);

tarefaEquipeForm.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const id = tarefaEquipeIdEl.value;

  if (id) {
    const tarefa = tarefasEquipe.find(t => t.id === id);
    tarefa.titulo = tarefaEquipeTituloEl.value.trim();
    tarefa.responsavelId = tarefaEquipeResponsavelEl.value;
    tarefa.prazo = tarefaEquipePrazoEl.value;
    tarefa.status = tarefaEquipeStatusEl.value;
    tarefa.descricao = tarefaEquipeDescEl.value.trim();
  } else {
    tarefasEquipe.push({
      id: Date.now().toString(),
      titulo: tarefaEquipeTituloEl.value.trim(),
      responsavelId: tarefaEquipeResponsavelEl.value,
      prazo: tarefaEquipePrazoEl.value,
      status: tarefaEquipeStatusEl.value,
      descricao: tarefaEquipeDescEl.value.trim()
    });
  }

  salvarTarefasEquipe(tarefasEquipe);
  fecharTarefaEquipeForm();
  renderizarTarefasEquipe();
});

function mudarStatusTarefaEquipe(id, novoStatus) {
  const tarefa = tarefasEquipe.find(t => t.id === id);
  tarefa.status = novoStatus;
  salvarTarefasEquipe(tarefasEquipe);
  renderizarTarefasEquipe();
}

function excluirTarefaEquipe(id) {
  const confirmou = confirm('Tem certeza que quer excluir esta tarefa?');
  if (!confirmou) return;
  tarefasEquipe = tarefasEquipe.filter(t => t.id !== id);
  salvarTarefasEquipe(tarefasEquipe);
  renderizarTarefasEquipe();
}

function nomeResponsavel(responsavelId) {
  const colab = colaboradores.find(c => c.id === responsavelId);
  return colab ? colab.nome : 'Sem responsável';
}

function criarTarefaEquipeCard(tarefa) {
  const atrasada = tarefaEstaAtrasada(tarefa);
  const card = document.createElement('div');
  card.className = `tarefa-card status-${tarefa.status}` + (atrasada ? ' atrasada' : '');

  const opcoesStatus = Object.keys(rotuloStatus)
    .map(chave => `<option value="${chave}" ${tarefa.status === chave ? 'selected' : ''}>${rotuloStatus[chave]}</option>`)
    .join('');

  card.innerHTML = `
    <div class="tarefa-topo">
      <p class="tarefa-titulo ${tarefa.status === 'feito' ? 'riscado' : ''}">${escaparHtml(tarefa.titulo)}</p>
    </div>
    <span class="tarefa-responsavel">👤 ${escaparHtml(nomeResponsavel(tarefa.responsavelId))}</span>
    ${tarefa.prazo ? `<span class="tarefa-prazo ${atrasada ? 'atrasada' : ''}">${atrasada ? '⚠ ' : ''}Prazo: ${formatarData(tarefa.prazo)}</span>` : ''}
    ${tarefa.descricao ? `<p class="tarefa-desc">${escaparHtml(tarefa.descricao)}</p>` : ''}
    <div class="tarefa-acoes">
      <select data-acao="mudar-status">${opcoesStatus}</select>
      <div class="tarefa-acoes-btns">
        <button class="btn-link" data-acao="editar">Editar</button>
        <button class="btn-perigo" data-acao="excluir">Excluir</button>
      </div>
    </div>
  `;

  card.querySelector('[data-acao="mudar-status"]').addEventListener('change', (e) => mudarStatusTarefaEquipe(tarefa.id, e.target.value));
  card.querySelector('[data-acao="editar"]').addEventListener('click', () => abrirTarefaEquipeFormEdicao(tarefa));
  card.querySelector('[data-acao="excluir"]').addEventListener('click', () => excluirTarefaEquipe(tarefa.id));

  return card;
}

function renderizarTarefasEquipe() {
  Object.values(listasEquipePorStatus).forEach(lista => lista.innerHTML = '');

  const filtroResponsavel = tarefaEquipeFiltroResponsavelEl.value;

  const filtradas = tarefasEquipe.filter(t => !filtroResponsavel || t.responsavelId === filtroResponsavel);

  filtradas
    .slice()
    .sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999'))
    .forEach(tarefa => {
      listasEquipePorStatus[tarefa.status].appendChild(criarTarefaEquipeCard(tarefa));
    });

  const vazio = filtradas.length === 0;
  tarefaEquipeVazioEl.classList.toggle('escondido', !vazio);
  tarefaEquipeVazioEl.textContent = tarefasEquipe.length === 0
    ? 'Nenhuma tarefa cadastrada ainda.'
    : 'Nenhuma tarefa encontrada com esse filtro.';
  colunasTarefasEquipeEl.classList.toggle('escondido', vazio);
}

tarefaEquipeFiltroResponsavelEl.addEventListener('change', renderizarTarefasEquipe);

// ---------- Início ----------

renderizarColaboradores();
renderizarTarefasEquipe();
