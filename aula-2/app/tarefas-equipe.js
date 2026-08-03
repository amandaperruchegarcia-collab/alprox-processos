// Importar configuração do Supabase
import { supabase, usuario_id } from './supabase-config.js';

const CHAVE_STORAGE_COLABORADORES = 'alprox_colaboradores';

function carregarColaboradores() {
  const dados = localStorage.getItem(CHAVE_STORAGE_COLABORADORES);
  return dados ? JSON.parse(dados) : [];
}

function salvarColaboradores(lista) {
  localStorage.setItem(CHAVE_STORAGE_COLABORADORES, JSON.stringify(lista));
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

// ===== FUNÇÕES DE SUPABASE PARA TAREFAS_EQUIPE =====

/**
 * Carrega tarefas da equipe do Supabase
 * Lógica especial: usuário vê tarefas onde criado_por = usuario_id OR atribuido_para = usuario_id
 * @param {string|null} filtroResponsavel - ID do responsável para filtrar (opcional)
 * @returns {Promise<Array>} Lista de tarefas
 */
async function carregarTarefasEquipe(filtroResponsavel = null) {
  try {
    let query = supabase
      .from('tarefas_equipe')
      .select('*')
      .or(`criado_por.eq.${usuario_id},atribuido_para.eq.${usuario_id}`);

    // Se há filtro por responsável, adiciona condição adicional
    if (filtroResponsavel) {
      query = query.eq('atribuido_para', filtroResponsavel);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao carregar tarefas da equipe:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao carregar tarefas da equipe:', error);
    return [];
  }
}

/**
 * Salva uma nova tarefa da equipe no Supabase
 * @param {Object} tarefa - Objeto com titulo, responsavelId, prazo, status, descricao
 * @returns {Promise<void>}
 */
async function salvarTarefaEquipe(tarefa) {
  try {
    const { error } = await supabase
      .from('tarefas_equipe')
      .insert({
        criado_por: usuario_id,
        atribuido_para: tarefa.responsavelId,
        titulo: tarefa.titulo,
        descricao: tarefa.descricao || '',
        prazo: tarefa.prazo || null,
        status: tarefa.status || 'a-fazer'
      });

    if (error) {
      console.error('Erro ao salvar tarefa da equipe:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar tarefa da equipe:', error);
    throw error;
  }
}

/**
 * Atualiza uma tarefa da equipe no Supabase
 * Validação de segurança: só permite atualizar tarefas que o usuário criou
 * @param {string} id - ID da tarefa
 * @param {Object} tarefa - Objeto com campos a atualizar
 * @returns {Promise<void>}
 */
async function atualizarTarefaEquipe(id, tarefa) {
  try {
    const { error } = await supabase
      .from('tarefas_equipe')
      .update({
        titulo: tarefa.titulo,
        atribuido_para: tarefa.responsavelId,
        prazo: tarefa.prazo || null,
        status: tarefa.status,
        descricao: tarefa.descricao || '',
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)
      .eq('criado_por', usuario_id);  // Validação: só edita se criou

    if (error) {
      console.error('Erro ao atualizar tarefa da equipe:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar tarefa da equipe:', error);
    throw error;
  }
}

/**
 * Deleta uma tarefa da equipe no Supabase
 * Validação de segurança: só permite deletar tarefas que o usuário criou
 * @param {string} id - ID da tarefa
 * @returns {Promise<void>}
 */
async function deletarTarefaEquipe(id) {
  try {
    const { error } = await supabase
      .from('tarefas_equipe')
      .delete()
      .eq('id', id)
      .eq('criado_por', usuario_id);  // Validação: só deleta se criou

    if (error) {
      console.error('Erro ao deletar tarefa da equipe:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar tarefa da equipe:', error);
    throw error;
  }
}

let colaboradores = carregarColaboradores();
let tarefasEquipe = [];  // Será carregado do Supabase

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

colabForm.addEventListener('submit', async (evento) => {
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
  await renderizarTarefasEquipe();
});

async function excluirColaborador(id) {
  const confirmou = confirm('Excluir este colaborador? As tarefas já atribuídas a ele continuam na lista, só ficam sem responsável.');
  if (!confirmou) return;
  colaboradores = colaboradores.filter(c => c.id !== id);
  salvarColaboradores(colaboradores);
  renderizarColaboradores();
  await renderizarTarefasEquipe();
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

tarefaEquipeForm.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const id = tarefaEquipeIdEl.value;
  const dadosTarefa = {
    titulo: tarefaEquipeTituloEl.value.trim(),
    responsavelId: tarefaEquipeResponsavelEl.value,
    prazo: tarefaEquipePrazoEl.value,
    status: tarefaEquipeStatusEl.value,
    descricao: tarefaEquipeDescEl.value.trim()
  };

  try {
    if (id) {
      // Editar tarefa existente
      await atualizarTarefaEquipe(id, dadosTarefa);
    } else {
      // Criar nova tarefa
      await salvarTarefaEquipe(dadosTarefa);
    }

    fecharTarefaEquipeForm();
    await renderizarTarefasEquipe();
  } catch (error) {
    alert('Erro ao salvar tarefa: ' + error.message);
  }
});

async function mudarStatusTarefaEquipe(id, novoStatus) {
  try {
    // Encontra a tarefa local para pegar dados necessários
    const tarefa = tarefasEquipe.find(t => t.id === id);
    if (!tarefa) return;

    // Atualiza no Supabase
    await atualizarTarefaEquipe(id, {
      titulo: tarefa.titulo,
      responsavelId: tarefa.atribuido_para,
      prazo: tarefa.prazo,
      status: novoStatus,
      descricao: tarefa.descricao
    });

    // Recarrega lista
    await renderizarTarefasEquipe();
  } catch (error) {
    console.error('Erro ao mudar status:', error);
    alert('Erro ao atualizar status da tarefa');
  }
}

async function excluirTarefaEquipe(id) {
  const confirmou = confirm('Tem certeza que quer excluir esta tarefa?');
  if (!confirmou) return;

  try {
    await deletarTarefaEquipe(id);
    await renderizarTarefasEquipe();
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    alert('Erro ao excluir tarefa');
  }
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

async function renderizarTarefasEquipe() {
  try {
    // Limpar listas
    Object.values(listasEquipePorStatus).forEach(lista => lista.innerHTML = '');

    const filtroResponsavel = tarefaEquipeFiltroResponsavelEl.value;

    // Carregar tarefas do Supabase com filtro opcional
    tarefasEquipe = await carregarTarefasEquipe(filtroResponsavel || null);

    // Renderizar as tarefas
    tarefasEquipe
      .slice()
      .sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999'))
      .forEach(tarefa => {
        // Converter campos do Supabase para o formato esperado pela função de renderização
        const tarefaFormatada = {
          id: tarefa.id,
          titulo: tarefa.titulo,
          descricao: tarefa.descricao,
          prazo: tarefa.prazo,
          status: tarefa.status,
          responsavelId: tarefa.atribuido_para,  // Campo do Supabase é atribuido_para
          atribuido_para: tarefa.atribuido_para  // Mantém também com nome original
        };

        if (listasEquipePorStatus[tarefaFormatada.status]) {
          listasEquipePorStatus[tarefaFormatada.status].appendChild(criarTarefaEquipeCard(tarefaFormatada));
        }
      });

    // Atualizar mensagem de vazio
    const vazio = tarefasEquipe.length === 0;
    tarefaEquipeVazioEl.classList.toggle('escondido', !vazio);
    tarefaEquipeVazioEl.textContent = tarefasEquipe.length === 0
      ? 'Nenhuma tarefa cadastrada ainda.'
      : 'Nenhuma tarefa encontrada com esse filtro.';
    colunasTarefasEquipeEl.classList.toggle('escondido', vazio);
  } catch (error) {
    console.error('Erro ao renderizar tarefas da equipe:', error);
    tarefaEquipeVazioEl.textContent = 'Erro ao carregar tarefas. Verifique a conexão.';
    tarefaEquipeVazioEl.classList.remove('escondido');
  }
}

tarefaEquipeFiltroResponsavelEl.addEventListener('change', renderizarTarefasEquipe);

// ---------- Início ----------

renderizarColaboradores();

// Carregar tarefas da equipe do Supabase quando a página inicializa
document.addEventListener('DOMContentLoaded', async () => {
  // Aguarda um pouco para garantir que usuario_id foi inicializado
  const tentarCarregar = setInterval(async () => {
    if (usuario_id) {
      clearInterval(tentarCarregar);
      await renderizarTarefasEquipe();
    }
  }, 100);

  // Timeout: se usuario_id não foi inicializado em 5 segundos, parar de tentar
  setTimeout(() => clearInterval(tentarCarregar), 5000);
});

// Recarregar tarefas quando usuário faz login
window.addEventListener('usuario-logado', async () => {
  await renderizarTarefasEquipe();
});
