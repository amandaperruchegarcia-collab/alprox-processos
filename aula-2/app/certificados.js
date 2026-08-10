// Importar Supabase e variáveis globais
import { supabase } from './supabase-config.js';

let certificados = [];

/**
 * Carregar certificados do Supabase (pessoal do usuário)
 * Calcula status automaticamente: 'vencido' se data_validade < hoje, senão 'válido'
 */
async function carregarCertificados() {
  try {
    // Importa usuario_id do arquivo supabase-config.js
    const { usuario_id } = await import('./supabase-config.js').then(m => ({
      usuario_id: m.usuario_id
    }));

    if (!usuario_id) {
      console.error('Erro: usuario_id não definido');
      return [];
    }

    const { data, error } = await supabase
      .from('certificados')
      .select('*')
      .eq('usuario_id', usuario_id)
      .order('data_validade', { ascending: true });

    if (error) {
      console.error('Erro ao carregar certificados:', error);
      return [];
    }

    // Calcular status automaticamente (vencido vs válido)
    const hoje = new Date().toISOString().split('T')[0];
    certificados = (data || []).map(c => {
      const dataValidade = c.data_validade;
      const statusCalculado = dataValidade < hoje ? 'vencido' : 'válido';
      return {
        ...c,
        // Mapear campos do DB para camelCase (compatibilidade com rest do código)
        id: c.id,
        clienteId: c.cliente_id,
        tipo: c.tipo,
        emissao: c.data_emissao,
        validade: c.data_validade,
        responsavelId: c.responsavel_id,
        status: statusCalculado
      };
    });

    return certificados;
  } catch (error) {
    console.error('Erro ao carregar certificados:', error);
    return [];
  }
}

/**
 * Salvar novo certificado no Supabase
 */
async function salvarCertificado(certificado) {
  try {
    const { usuario_id } = await import('./supabase-config.js').then(m => ({
      usuario_id: m.usuario_id
    }));

    if (!usuario_id) {
      throw new Error('usuario_id não definido');
    }

    // Calcular status baseado na data de validade
    const hoje = new Date().toISOString().split('T')[0];
    const status = certificado.validade < hoje ? 'vencido' : 'válido';

    const { error } = await supabase
      .from('certificados')
      .insert({
        usuario_id: usuario_id,
        cliente_id: certificado.clienteId || null,
        tipo: certificado.tipo,
        data_emissao: certificado.emissao || null,
        data_validade: certificado.validade,
        responsavel_id: certificado.responsavelId || null,
        status: status
      });

    if (error) {
      throw error;
    }

    console.log('✅ Certificado salvo com sucesso');
  } catch (error) {
    console.error('Erro ao salvar certificado:', error);
    throw error;
  }
}

/**
 * Atualizar certificado existente no Supabase
 */
async function atualizarCertificado(id, certificado) {
  try {
    // Calcular status baseado na data de validade
    const hoje = new Date().toISOString().split('T')[0];
    const status = certificado.validade < hoje ? 'vencido' : 'válido';

    const { error } = await supabase
      .from('certificados')
      .update({
        cliente_id: certificado.clienteId || null,
        tipo: certificado.tipo,
        data_emissao: certificado.emissao || null,
        data_validade: certificado.validade,
        responsavel_id: certificado.responsavelId || null,
        status: status,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw error;
    }

    console.log('✅ Certificado atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar certificado:', error);
    throw error;
  }
}

/**
 * Deletar certificado do Supabase
 */
async function deletarCertificado(id) {
  try {
    const { error } = await supabase
      .from('certificados')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    console.log('✅ Certificado deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar certificado:', error);
    throw error;
  }
}

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

certificadoForm.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  try {
    const id = certificadoIdEl.value;
    const certificado = {
      clienteId: certificadoClienteEl.value,
      tipo: certificadoTipoEl.value,
      emissao: certificadoEmissaoEl.value,
      validade: certificadoValidadeEl.value,
      responsavelId: certificadoResponsavelEl.value
    };

    if (id) {
      // Editar certificado existente
      await atualizarCertificado(id, certificado);
    } else {
      // Criar novo certificado
      await salvarCertificado(certificado);
    }

    fecharCertificadoForm();
    // Recarregar lista do Supabase
    await carregarCertificados();
    renderizarCertificados();
  } catch (error) {
    console.error('Erro ao salvar certificado:', error);
    alert('Erro ao salvar certificado. Verifique o console.');
  }
});

// ---------- Ações ----------

async function excluirCertificado(id) {
  const confirmou = confirm('Tem certeza que quer excluir este certificado?');
  if (!confirmou) return;

  try {
    await deletarCertificado(id);
    // Recarregar lista do Supabase
    await carregarCertificados();
    renderizarCertificados();
  } catch (error) {
    console.error('Erro ao excluir certificado:', error);
    alert('Erro ao excluir certificado. Verifique o console.');
  }
}

// ---------- Renderização (reaproveita situacaoValidade e rotuloSituacao de certidoes.js) ----------

function criarCertificadoCard(certificado) {
  const situacao = situacaoValidade(certificado.validade);
  const card = document.createElement('div');
  // Adicionar classe 'alerta-vencimento' para destaque visual em certificados vencidos
  const classesCard = ['processo-card'];
  if (situacao === 'vencida') classesCard.push('inativo', 'alerta-vencimento');
  card.className = classesCard.join(' ');

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

/**
 * Inicializar módulo de certificados
 * Carrega dados do Supabase e renderiza lista
 */
async function inicializarCertificados() {
  try {
    await carregarCertificados();
    renderizarCertificados();
    console.log('✅ Módulo de certificados inicializado');
  } catch (error) {
    console.error('Erro ao inicializar certificados:', error);
  }
}

// Chamar inicialização quando o DOM está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarCertificados);
} else {
  inicializarCertificados();
}
