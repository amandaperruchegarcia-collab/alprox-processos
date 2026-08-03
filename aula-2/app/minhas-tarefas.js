const CHAVE_STORAGE_TAREFAS = 'alprox_minhas_tarefas';

function carregarTarefas() {
  const dados = localStorage.getItem(CHAVE_STORAGE_TAREFAS);
  return dados ? JSON.parse(dados) : [];
}

function salvarTarefas(lista) {
  localStorage.setItem(CHAVE_STORAGE_TAREFAS, JSON.stringify(lista));
}

let tarefas = carregarTarefas();

// ---------- Elementos ----------

const tarefaForm = document.getElementById('tarefa-form');
const tarefaNovoBtn = document.getElementById('tarefa-novo-btn');
const tarefaCancelarBtn = document.getElementById('tarefa-cancelar-btn');
const tarefaVazioEl = document.getElementById('tarefa-vazio');
const colunasTarefasEl = document.querySelector('.colunas-tarefas');

const tarefaIdEl = document.getElementById('tarefa-id');
const tarefaTituloEl = document.getElementById('tarefa-titulo');
const tarefaPrazoEl = document.getElementById('tarefa-prazo');
const tarefaStatusEl = document.getElementById('tarefa-status');
const tarefaDescEl = document.getElementById('tarefa-desc');

const listasPorStatus = {
  a_fazer: document.getElementById('tarefa-lista-a_fazer'),
  fazendo: document.getElementById('tarefa-lista-fazendo'),
  feito: document.getElementById('tarefa-lista-feito')
};

const rotuloStatus = {
  a_fazer: 'A fazer',
  fazendo: 'Fazendo',
  feito: 'Feito'
};

// ---------- Form: abrir / fechar ----------

function abrirTarefaFormNovo() {
  tarefaForm.reset();
  tarefaIdEl.value = '';
  tarefaForm.classList.remove('escondido');
  tarefaTituloEl.focus();
}

function abrirTarefaFormEdicao(tarefa) {
  tarefaIdEl.value = tarefa.id;
  tarefaTituloEl.value = tarefa.titulo;
  tarefaPrazoEl.value = tarefa.prazo || '';
  tarefaStatusEl.value = tarefa.status;
  tarefaDescEl.value = tarefa.descricao || '';
  tarefaForm.classList.remove('escondido');
  tarefaTituloEl.focus();
}

function fecharTarefaForm() {
  tarefaForm.classList.add('escondido');
  tarefaForm.reset();
}

tarefaNovoBtn.addEventListener('click', abrirTarefaFormNovo);
tarefaCancelarBtn.addEventListener('click', fecharTarefaForm);

// ---------- Salvar (criar ou editar) ----------

tarefaForm.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const id = tarefaIdEl.value;

  if (id) {
    const tarefa = tarefas.find(t => t.id === id);
    tarefa.titulo = tarefaTituloEl.value.trim();
    tarefa.prazo = tarefaPrazoEl.value;
    tarefa.status = tarefaStatusEl.value;
    tarefa.descricao = tarefaDescEl.value.trim();
  } else {
    tarefas.push({
      id: Date.now().toString(),
      titulo: tarefaTituloEl.value.trim(),
      prazo: tarefaPrazoEl.value,
      status: tarefaStatusEl.value,
      descricao: tarefaDescEl.value.trim()
    });
  }

  salvarTarefas(tarefas);
  fecharTarefaForm();
  renderizarTarefas();
});

// ---------- Ações ----------

function mudarStatusTarefa(id, novoStatus) {
  const tarefa = tarefas.find(t => t.id === id);
  tarefa.status = novoStatus;
  salvarTarefas(tarefas);
  renderizarTarefas();
}

function excluirTarefa(id) {
  const confirmou = confirm('Tem certeza que quer excluir esta tarefa?');
  if (!confirmou) return;
  tarefas = tarefas.filter(t => t.id !== id);
  salvarTarefas(tarefas);
  renderizarTarefas();
}

// ---------- Renderização ----------

function tarefaEstaAtrasada(tarefa) {
  if (!tarefa.prazo || tarefa.status === 'feito') return false;
  const hoje = new Date().toISOString().slice(0, 10);
  return tarefa.prazo < hoje;
}

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

function criarTarefaCard(tarefa) {
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

  card.querySelector('[data-acao="mudar-status"]').addEventListener('change', (e) => mudarStatusTarefa(tarefa.id, e.target.value));
  card.querySelector('[data-acao="editar"]').addEventListener('click', () => abrirTarefaFormEdicao(tarefa));
  card.querySelector('[data-acao="excluir"]').addEventListener('click', () => excluirTarefa(tarefa.id));

  return card;
}

function renderizarTarefas() {
  Object.values(listasPorStatus).forEach(lista => lista.innerHTML = '');

  tarefas
    .slice()
    .sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999'))
    .forEach(tarefa => {
      listasPorStatus[tarefa.status].appendChild(criarTarefaCard(tarefa));
    });

  const vazio = tarefas.length === 0;
  tarefaVazioEl.classList.toggle('escondido', !vazio);
  colunasTarefasEl.classList.toggle('escondido', vazio);
}

// ---------- Início ----------

renderizarTarefas();
