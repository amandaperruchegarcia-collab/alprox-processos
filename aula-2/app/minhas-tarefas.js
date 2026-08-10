// Supabase integration for tarefas_pessoais (alprox_s_s_is table)
async function carregarTarefas() {
  const { data, error } = await window.supabase
    .from('alprox_tarefas_pessoais')
    .select('*')
    .eq('usuario_id', window.supabase_usuario_id)
    .order('prazo', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Erro ao carregar tarefas:', error);
    return [];
  }
  return data || [];
}

async function salvarTarefa(tarefa) {
  const { error } = await window.supabase
    .from('alprox_tarefas_pessoais')
    .insert({
      usuario_id: window.supabase_usuario_id,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao || '',
      prazo: tarefa.prazo || null,
      status: tarefa.status || 'a-fazer'
    });

  if (error) {
    console.error('Erro ao salvar tarefa:', error);
    throw error;
  }
}

async function atualizarTarefa(id, tarefaAtualizada) {
  const { error } = await window.supabase
    .from('alprox_tarefas_pessoais')
    .update({
      titulo: tarefaAtualizada.titulo,
      descricao: tarefaAtualizada.descricao || '',
      prazo: tarefaAtualizada.prazo || null,
      status: tarefaAtualizada.status,
      atualizado_em: new Date().toISOString()
    })
    .eq('id', id)
    .eq('usuario_id', window.supabase_usuario_id);

  if (error) {
    console.error('Erro ao atualizar tarefa:', error);
    throw error;
  }
}

async function deletarTarefa(id) {
  const { error } = await window.supabase
    .from('alprox_tarefas_pessoais')
    .delete()
    .eq('id', id)
    .eq('usuario_id', window.supabase_usuario_id);

  if (error) {
    console.error('Erro ao deletar tarefa:', error);
    throw error;
  }
}

let tarefas = [];

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

tarefaForm.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const id = tarefaIdEl.value;
  const novosDados = {
    titulo: tarefaTituloEl.value.trim(),
    prazo: tarefaPrazoEl.value,
    status: tarefaStatusEl.value,
    descricao: tarefaDescEl.value.trim()
  };

  try {
    if (id) {
      // Editar tarefa existente
      await atualizarTarefa(id, novosDados);
    } else {
      // Criar nova tarefa
      await salvarTarefa(novosDados);
    }

    fecharTarefaForm();
    await atualizarListaTarefas();
  } catch (erro) {
    console.error('Erro ao salvar tarefa:', erro);
    alert('Erro ao salvar tarefa. Tente novamente.');
  }
});

// ---------- Ações ----------

async function mudarStatusTarefa(id, novoStatus) {
  try {
    await atualizarTarefa(id, { status: novoStatus });
    await atualizarListaTarefas();
  } catch (erro) {
    console.error('Erro ao mudar status:', erro);
    alert('Erro ao mudar status da tarefa.');
  }
}

async function excluirTarefa(id) {
  const confirmou = confirm('Tem certeza que quer excluir esta tarefa?');
  if (!confirmou) return;

  try {
    await deletarTarefa(id);
    await atualizarListaTarefas();
  } catch (erro) {
    console.error('Erro ao excluir tarefa:', erro);
    alert('Erro ao excluir tarefa.');
  }
}

// Função auxiliar para atualizar a lista renderizada
async function atualizarListaTarefas() {
  tarefas = await carregarTarefas();
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

  card.querySelector('[data-acao="mudar-status"]').addEventListener('change', async (e) => {
    await mudarStatusTarefa(tarefa.id, e.target.value);
  });
  card.querySelector('[data-acao="editar"]').addEventListener('click', () => abrirTarefaFormEdicao(tarefa));
  card.querySelector('[data-acao="excluir"]').addEventListener('click', async () => {
    await excluirTarefa(tarefa.id);
  });

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

// Carregar tarefas ao inicializar
async function inicializarTarefas() {
  if (!window.supabase_usuario_id) {
    console.warn('Aguardando autenticação...');
    // Retentar após autenticação
    window.addEventListener('usuario-logado', inicializarTarefas);
    return;
  }
  await atualizarListaTarefas();
}

// Inicializar quando o DOM estiver pronto e usuario autenticado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarTarefas);
} else {
  inicializarTarefas();
}
