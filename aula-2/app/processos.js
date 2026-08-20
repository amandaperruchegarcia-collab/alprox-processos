import { supabase, usuario_id } from './supabase-config.js';
import { escaparHtml, ehUrlSegura } from './utils.js';

const DEPARTAMENTOS = [
  'Administrativo',
  'Contábil',
  'Societário',
  'Departamento Pessoal',
  'Fiscal',
  'Processos',
  'Treinamento'
];

let processos = [];

/**
 * Carrega processos do Supabase
 * @returns {Promise<Array>} Lista de processos ativos
 */
async function carregarProcessos() {
  try {
    const { data, error } = await supabase
      .from('alprox_processos')
      .select('*')
      .eq('status', 'ativo');

    if (error) {
      console.error('❌ Erro ao carregar processos:', error);
      return [];
    }

    processos = data || [];
    console.log('✅ Processos carregados:', processos.length);
    return processos;
  } catch (error) {
    console.error('❌ Erro ao carregar processos (catch):', error);
    return [];
  }
}

/**
 * Salva um novo processo no Supabase
 * @param {Object} processo - Dados do processo
 * @returns {Promise<void>}
 */
async function salvarProcesso(processo) {
  try {
    const { error } = await supabase
      .from('alprox_processos')
      .insert({
        nome: processo.nome,
        departamento: processo.departamento,
        codigo: processo.codigo,
        link_drive: processo.linkDrive,
        link_youtube: processo.linkYoutube,
        status: processo.status || 'ativo',
        observacoes: processo.observacoes,
        criado_por: usuario_id
      });

    if (error) {
      console.error('❌ Erro ao salvar processo:', error);
      throw error;
    }

    console.log('✅ Processo salvo com sucesso');
  } catch (error) {
    console.error('❌ Erro ao salvar processo (catch):', error);
    throw error;
  }
}

/**
 * Atualiza um processo no Supabase
 * @param {string} id - ID do processo
 * @param {Object} processoAtualizado - Dados atualizados
 * @returns {Promise<void>}
 */
async function atualizarProcesso(id, processoAtualizado) {
  try {
    const { error } = await supabase
      .from('alprox_processos')
      .update({
        nome: processoAtualizado.nome,
        departamento: processoAtualizado.departamento,
        codigo: processoAtualizado.codigo,
        link_drive: processoAtualizado.linkDrive,
        link_youtube: processoAtualizado.linkYoutube,
        status: processoAtualizado.status,
        observacoes: processoAtualizado.observacoes,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao atualizar processo:', error);
      throw error;
    }

    console.log('✅ Processo atualizado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao atualizar processo (catch):', error);
    throw error;
  }
}

/**
 * Deleta um processo do Supabase
 * @param {string} id - ID do processo
 * @returns {Promise<void>}
 */
async function deletarProcesso(id) {
  try {
    const { error } = await supabase
      .from('alprox_processos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar processo:', error);
      throw error;
    }

    console.log('✅ Processo deletado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao deletar processo (catch):', error);
    throw error;
  }
}

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

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  try {
    const id = idEl.value;

    if (id) {
      // Editar processo existente
      const processoAtualizado = {
        nome: nomeEl.value.trim(),
        departamento: deptoEl.value,
        codigo: codigoEl.value.trim(),
        linkDrive: driveEl.value.trim(),
        linkYoutube: youtubeEl.value.trim(),
        observacoes: obsEl.value.trim(),
        status: 'ativo'
      };
      await atualizarProcesso(id, processoAtualizado);
    } else {
      // Criar novo processo
      const novoProcesso = {
        nome: nomeEl.value.trim(),
        departamento: deptoEl.value,
        codigo: codigoEl.value.trim(),
        linkDrive: driveEl.value.trim(),
        linkYoutube: youtubeEl.value.trim(),
        observacoes: obsEl.value.trim(),
        status: 'ativo'
      };
      await salvarProcesso(novoProcesso);
    }

    fecharForm();
    await carregarProcessos();
    renderizarLista();
  } catch (error) {
    console.error('❌ Erro ao salvar/atualizar processo:', error);
    alert('Erro ao salvar processo. Verifique o console.');
  }
});

// ---------- Ações da lista ----------

async function alternarStatus(id) {
  try {
    const processo = processos.find(p => p.id === id);
    if (!processo) return;

    const novoStatus = processo.status === 'ativo' ? 'inativo' : 'ativo';
    await atualizarProcesso(id, { ...processo, status: novoStatus });

    await carregarProcessos();
    renderizarLista();
  } catch (error) {
    console.error('❌ Erro ao alternar status:', error);
    alert('Erro ao alterar status. Verifique o console.');
  }
}

async function excluirProcesso(id) {
  const confirmou = confirm('Tem certeza que quer excluir este processo? Essa ação não pode ser desfeita.');
  if (!confirmou) return;

  try {
    await deletarProcesso(id);
    await carregarProcessos();
    renderizarLista();
  } catch (error) {
    console.error('❌ Erro ao excluir processo:', error);
    alert('Erro ao excluir processo. Verifique o console.');
  }
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


async function renderizarLista() {
  try {
    const termoBusca = buscaEl.value.trim().toLowerCase();
    const deptoFiltro = filtroDeptoEl.value;
    const mostrarInativos = mostrarInativosEl.checked;

    // Se vai mostrar inativos, carregar também processos inativos
    let dadosParaRenderizar = [...processos];

    if (mostrarInativos) {
      const { data: inativos, error } = await supabase
        .from('alprox_processos')
        .select('*')
        .eq('status', 'inativo');

      if (!error && inativos) {
        dadosParaRenderizar = [...processos, ...inativos];
      }
    }

    const filtrados = dadosParaRenderizar.filter(p => {
      if (!mostrarInativos && p.status === 'inativo') return false;
      if (deptoFiltro && p.departamento !== deptoFiltro) return false;
      if (termoBusca && !p.nome.toLowerCase().includes(termoBusca)) return false;
      return true;
    });

    listaEl.innerHTML = '';

    if (filtrados.length === 0) {
      vazioEl.classList.remove('escondido');
      vazioEl.textContent = dadosParaRenderizar.length === 0
        ? 'Nenhum processo cadastrado ainda. Clique em "+ Novo processo" pra começar.'
        : 'Nenhum processo encontrado com esse filtro.';
    } else {
      vazioEl.classList.add('escondido');
      filtrados.forEach(p => listaEl.appendChild(criarCard(p)));
    }
  } catch (error) {
    console.error('❌ Erro ao renderizar lista:', error);
  }
}

buscaEl.addEventListener('input', renderizarLista);
filtroDeptoEl.addEventListener('change', renderizarLista);
mostrarInativosEl.addEventListener('change', renderizarLista);

// ---------- Início ----------

async function inicializar() {
  try {
    preencherSelectsDepartamento();
    await carregarProcessos();
    renderizarLista();
  } catch (error) {
    console.error('❌ Erro ao inicializar:', error);
  }
}

// Inicializar quando o módulo carregar
inicializar();

// Re-inicializar quando usuário fizer login
window.addEventListener('usuario-logado', () => {
  console.log('🔄 Recarregando processos após login...');
  inicializar();
});
