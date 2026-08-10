// Estado global
let fluxos = [];
let fluxoAbertoId = null;
let slotAberto = null; // { fluxoId, passoPaiId, campo }
let passoEmEdicaoId = null;

// Supabase queries para fluxos
async function carregarFluxos() {
  const { data, error } = await supabase
    .from('alprox_fluxos')
    .select('*')
    .order('nome');

  if (error) {
    console.error('Erro ao carregar fluxos:', error);
    return [];
  }
  return data || [];
}

async function salvarFluxo(fluxo) {
  const { data, error } = await supabase
    .from('alprox_fluxos')
    .insert({
      nome: fluxo.nome,
      criado_por: usuario_id
    })
    .select();

  if (error) {
    console.error('Erro ao salvar fluxo:', error);
    throw error;
  }
  return data[0]; // retorna o fluxo criado com ID
}

async function atualizarFluxo(id, fluxo) {
  const { error } = await supabase
    .from('alprox_fluxos')
    .update({
      nome: fluxo.nome,
      atualizado_em: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar fluxo:', error);
    throw error;
  }
}

async function deletarFluxo(id) {
  const { error } = await supabase
    .from('alprox_fluxos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar fluxo:', error);
    throw error;
  }
}

// Supabase queries para passos
async function carregarPassos(fluxoId) {
  const { data, error } = await supabase
    .from('alprox_passos_fluxo')
    .select('*')
    .eq('fluxo_id', fluxoId)
    .order('ordem');

  if (error) {
    console.error('Erro ao carregar passos:', error);
    return [];
  }
  return data || [];
}

async function adicionarPasso(fluxoId, passo) {
  const { error } = await supabase
    .from('alprox_passos_fluxo')
    .insert({
      fluxo_id: fluxoId,
      tipo: passo.tipo,
      texto: passo.texto,
      processo_id: passo.processo_id || null,
      ordem: passo.ordem,
      proximo_sim_id: passo.proximo_sim_id || null,
      proximo_nao_id: passo.proximo_nao_id || null
    });

  if (error) {
    console.error('Erro ao adicionar passo:', error);
    throw error;
  }
}

async function atualizarPasso(passoId, passo) {
  const { error } = await supabase
    .from('alprox_passos_fluxo')
    .update({
      tipo: passo.tipo,
      texto: passo.texto,
      processo_id: passo.processo_id || null,
      ordem: passo.ordem,
      proximo_sim_id: passo.proximo_sim_id || null,
      proximo_nao_id: passo.proximo_nao_id || null,
      atualizado_em: new Date().toISOString()
    })
    .eq('id', passoId);

  if (error) {
    console.error('Erro ao atualizar passo:', error);
    throw error;
  }
}

async function deletarPasso(passoId) {
  const { error } = await supabase
    .from('alprox_passos_fluxo')
    .delete()
    .eq('id', passoId);

  if (error) {
    console.error('Erro ao deletar passo:', error);
    throw error;
  }
}

// Helper para buscar nome do processo
async function nomeProcesso(processoId) {
  if (!processoId) return null;

  const { data, error } = await supabase
    .from('processos')
    .select('nome')
    .eq('id', processoId)
    .single();

  if (error) {
    console.error('Erro ao buscar processo:', error);
    return null;
  }
  return data ? data.nome : null;
}

// ---------- Elementos ----------

const fluxoForm = document.getElementById('fluxo-form');
const fluxoNovoBtn = document.getElementById('fluxo-novo-btn');
const fluxoCancelarBtn = document.getElementById('fluxo-cancelar-btn');
const fluxoListaEl = document.getElementById('fluxo-lista');
const fluxoVazioEl = document.getElementById('fluxo-vazio');
const fluxoBuscaEl = document.getElementById('fluxo-busca');
const fluxoNomeEl = document.getElementById('fluxo-nome');

// ---------- Criar fluxo ----------

fluxoNovoBtn.addEventListener('click', () => {
  fluxoForm.reset();
  fluxoForm.classList.remove('escondido');
  fluxoNomeEl.focus();
});

fluxoCancelarBtn.addEventListener('click', () => {
  fluxoForm.classList.add('escondido');
  fluxoForm.reset();
});

fluxoForm.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    const novoFluxo = {
      nome: fluxoNomeEl.value.trim()
    };

    const fluxoCriado = await salvarFluxo(novoFluxo);
    fluxos.push(fluxoCriado);
    fluxoForm.classList.add('escondido');
    fluxoForm.reset();
    fluxoAbertoId = fluxoCriado.id;
    await renderizarFluxos();
  } catch (erro) {
    console.error('Erro ao criar fluxo:', erro);
    alert('Erro ao criar fluxo. Tente novamente.');
  }
});

async function excluirFluxo(id) {
  const confirmou = confirm('Tem certeza que quer excluir este fluxo inteiro?');
  if (!confirmou) return;

  try {
    await deletarFluxo(id);
    fluxos = fluxos.filter(f => f.id !== id);
    await renderizarFluxos();
  } catch (erro) {
    console.error('Erro ao excluir fluxo:', erro);
    alert('Erro ao excluir fluxo. Tente novamente.');
  }
}

function alternarFluxo(id) {
  fluxoAbertoId = fluxoAbertoId === id ? null : id;
  slotAberto = null;
  passoEmEdicaoId = null;
  renderizarFluxos();
}

// ---------- Adicionar / editar / excluir passo ----------

async function adicionarPassoNovo(fluxoId, passoPaiId, campo, dados) {
  try {
    // Calcular ordem (simplificado: usar timestamp)
    const ordem = Date.now();

    const novoPasso = {
      tipo: dados.tipo,
      texto: dados.texto.trim(),
      processo_id: dados.tipo === 'acao' ? (dados.processoId || null) : null,
      ordem: ordem,
      proximo_sim_id: null,
      proximo_nao_id: null
    };

    const { data: passoCriado, error } = await supabase
      .from('alprox_passos_fluxo')
      .insert({
        fluxo_id: fluxoId,
        ...novoPasso
      })
      .select();

    if (error) throw error;

    // Se há um passo pai, atualizar sua referência
    if (passoPaiId && campo && campo !== 'inicio') {
      const { data: passoPai } = await supabase
        .from('alprox_passos_fluxo')
        .select('*')
        .eq('id', passoPaiId)
        .single();

      if (passoPai) {
        const atualizacao = {};
        atualizacao[campo] = passoCriado[0].id;
        await supabase
          .from('alprox_passos_fluxo')
          .update(atualizacao)
          .eq('id', passoPaiId);
      }
    }

    slotAberto = null;
    await renderizarFluxos();
  } catch (erro) {
    console.error('Erro ao adicionar passo:', erro);
    alert('Erro ao adicionar passo. Tente novamente.');
  }
}

async function editarPassoExistente(fluxoId, passoId, texto, processoId, tipo) {
  try {
    await atualizarPasso(passoId, {
      tipo: tipo,
      texto: texto.trim(),
      processo_id: tipo === 'acao' ? (processoId || null) : null,
      ordem: 0
    });
    passoEmEdicaoId = null;
    await renderizarFluxos();
  } catch (erro) {
    console.error('Erro ao editar passo:', erro);
    alert('Erro ao editar passo. Tente novamente.');
  }
}

async function excluirPassoComDescendentes(fluxoId, passoId) {
  const confirmou = confirm('Excluir este passo? Referências a ele serão removidas.');
  if (!confirmou) return;

  try {
    // Buscar todas as referências a este passo
    const { data: referencedBy } = await supabase
      .from('alprox_passos_fluxo')
      .select('id')
      .eq('fluxo_id', fluxoId)
      .or(`proximo_sim_id.eq.${passoId},proximo_nao_id.eq.${passoId}`);

    // Limpar referências
    if (referencedBy && referencedBy.length > 0) {
      for (const ref of referencedBy) {
        await supabase
          .from('alprox_passos_fluxo')
          .update({
            proximo_sim_id: ref.proximo_sim_id === passoId ? null : ref.proximo_sim_id,
            proximo_nao_id: ref.proximo_nao_id === passoId ? null : ref.proximo_nao_id
          })
          .eq('id', ref.id);
      }
    }

    // Deletar o passo
    await deletarPasso(passoId);
    await renderizarFluxos();
  } catch (erro) {
    console.error('Erro ao excluir passo:', erro);
    alert('Erro ao excluir passo. Tente novamente.');
  }
}

// ---------- Ir para o processo relacionado ----------

function irParaProcesso(nomeDoProcesso) {
  mudarTela('tela-processos');
  if (buscaEl) {
    buscaEl.value = nomeDoProcesso;
    if (typeof renderizarLista === 'function') {
      renderizarLista();
    }
  }
}

// ---------- Construção visual da árvore ----------

function criarSeta() {
  const el = document.createElement('div');
  el.className = 'fluxo-seta';
  el.textContent = '▼';
  return el;
}

function criarCaixaTerminal(rotulo, classeExtra) {
  const el = document.createElement('div');
  el.className = 'fluxo-no-terminal ' + classeExtra;
  el.textContent = rotulo;
  return el;
}

async function criarSelectProcessos(valorAtual) {
  const select = document.createElement('select');
  select.innerHTML = '<option value="">Nenhum processo relacionado</option>';

  try {
    const { data: processos, error } = await supabase
      .from('processos')
      .select('id, nome')
      .eq('status', 'ativo')
      .order('nome');

    if (!error && processos) {
      processos.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.nome;
        select.appendChild(opt);
      });
    }
  } catch (erro) {
    console.error('Erro ao carregar processos:', erro);
  }

  if (valorAtual) select.value = valorAtual;
  return select;
}

async function criarFormPasso({ modo, fluxoId, passoPaiId, campo, passoExistente, aoCancelar }) {
  const form = document.createElement('form');
  form.className = 'fluxo-form-passo';
  form.addEventListener('submit', (e) => e.preventDefault());

  const campoTipo = document.createElement('div');
  campoTipo.className = 'campo';
  const labelTipo = document.createElement('label');
  labelTipo.textContent = 'Tipo de passo';
  campoTipo.appendChild(labelTipo);

  const selectTipo = document.createElement('select');
  const optAcao = document.createElement('option');
  optAcao.value = 'acao';
  optAcao.textContent = 'Ação (o que fazer)';
  const optDecisao = document.createElement('option');
  optDecisao.value = 'decisao';
  optDecisao.textContent = 'Decisão (pergunta sim/não)';
  selectTipo.appendChild(optAcao);
  selectTipo.appendChild(optDecisao);

  if (modo === 'editar') {
    selectTipo.value = passoExistente.tipo;
    selectTipo.disabled = true;
  }
  campoTipo.appendChild(selectTipo);

  const campoTexto = document.createElement('div');
  campoTexto.className = 'campo';
  const rotuloTexto = document.createElement('label');
  rotuloTexto.textContent = 'Texto';
  const inputTexto = document.createElement('input');
  inputTexto.type = 'text';
  const atualizarPlaceholder = () => {
    inputTexto.placeholder = selectTipo.value === 'decisao' ? 'Ex: Pagamento em dia?' : 'Ex: Gerar guia do DAS';
  };
  atualizarPlaceholder();
  if (passoExistente) inputTexto.value = passoExistente.texto;
  campoTexto.appendChild(rotuloTexto);
  campoTexto.appendChild(inputTexto);

  const campoProcesso = document.createElement('div');
  campoProcesso.className = 'campo';
  const labelProcesso = document.createElement('label');
  labelProcesso.textContent = 'Processo relacionado (opcional)';
  campoProcesso.appendChild(labelProcesso);
  const selectProcesso = await criarSelectProcessos(passoExistente ? passoExistente.processo_id : '');
  campoProcesso.appendChild(selectProcesso);

  const atualizarVisibilidadeProcesso = () => {
    campoProcesso.style.display = selectTipo.value === 'acao' ? 'flex' : 'none';
  };
  atualizarVisibilidadeProcesso();
  selectTipo.addEventListener('change', () => {
    atualizarPlaceholder();
    atualizarVisibilidadeProcesso();
  });

  const acoes = document.createElement('div');
  acoes.className = 'form-acoes';
  const btnCancelar = document.createElement('button');
  btnCancelar.type = 'button';
  btnCancelar.className = 'btn-secundario';
  btnCancelar.textContent = 'Cancelar';
  btnCancelar.addEventListener('click', aoCancelar);

  const btnSalvar = document.createElement('button');
  btnSalvar.type = 'button';
  btnSalvar.className = 'btn-primario';
  btnSalvar.textContent = modo === 'editar' ? 'Salvar' : 'Adicionar';
  btnSalvar.addEventListener('click', async () => {
    if (!inputTexto.value.trim()) {
      inputTexto.focus();
      return;
    }
    if (modo === 'editar') {
      await editarPassoExistente(fluxoId, passoExistente.id, inputTexto.value, selectProcesso.value, selectTipo.value);
    } else {
      await adicionarPassoNovo(fluxoId, passoPaiId, campo, {
        tipo: selectTipo.value,
        texto: inputTexto.value,
        processoId: selectProcesso.value
      });
    }
  });
  acoes.appendChild(btnCancelar);
  acoes.appendChild(btnSalvar);

  form.appendChild(campoTipo);
  form.appendChild(campoTexto);
  form.appendChild(campoProcesso);
  form.appendChild(acoes);

  return form;
}

function slotEstaAberto(fluxoId, passoPaiId, campo) {
  return slotAberto && slotAberto.fluxoId === fluxoId && slotAberto.passoPaiId === passoPaiId && slotAberto.campo === campo;
}

async function renderizarProximo(fluxo, passoMap, passoId, passoPaiId, campo, container) {
  container.appendChild(criarSeta());

  if (passoId && passoMap[passoId]) {
    await renderizarNo(fluxo, passoMap, passoId, container);
    return;
  }

  if (slotEstaAberto(fluxo.id, passoPaiId, campo)) {
    const form = await criarFormPasso({
      modo: 'novo',
      fluxoId: fluxo.id,
      passoPaiId,
      campo,
      aoCancelar: () => { slotAberto = null; renderizarFluxos(); }
    });
    container.appendChild(form);
  } else {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fluxo-btn-add';
    btn.textContent = '+ Adicionar passo';
    btn.addEventListener('click', () => {
      slotAberto = { fluxoId: fluxo.id, passoPaiId, campo };
      renderizarFluxos();
    });
    container.appendChild(btn);
    container.appendChild(criarSeta());
    container.appendChild(criarCaixaTerminal('Fim', 'fim'));
  }
}

async function renderizarNo(fluxo, passoMap, passoId, container) {
  const passo = passoMap[passoId];

  if (passoEmEdicaoId === passoId) {
    const form = await criarFormPasso({
      modo: 'editar',
      fluxoId: fluxo.id,
      passoExistente: passo,
      aoCancelar: () => { passoEmEdicaoId = null; renderizarFluxos(); }
    });
    container.appendChild(form);
    return;
  }

  if (passo.tipo === 'decisao') {
    const wrap = document.createElement('div');
    wrap.className = 'fluxo-no-decisao-wrap';
    const inner = document.createElement('div');
    inner.className = 'fluxo-no-decisao';
    wrap.appendChild(inner);
    const textoEl = document.createElement('div');
    textoEl.className = 'fluxo-no-decisao-texto';
    textoEl.textContent = passo.texto;
    wrap.appendChild(textoEl);
    container.appendChild(wrap);

    const acoes = document.createElement('div');
    acoes.className = 'fluxo-no-acoes';
    acoes.appendChild(criarBotaoAcao('Editar', () => { passoEmEdicaoId = passoId; renderizarFluxos(); }));
    acoes.appendChild(criarBotaoAcao('Excluir', () => excluirPassoComDescendentes(fluxo.id, passoId), true));
    container.appendChild(acoes);

    const ramos = document.createElement('div');
    ramos.className = 'fluxo-ramos';

    const ramoSim = document.createElement('div');
    ramoSim.className = 'fluxo-ramo';
    const rotuloSim = document.createElement('span');
    rotuloSim.className = 'fluxo-ramo-rotulo sim';
    rotuloSim.textContent = 'Sim';
    ramoSim.appendChild(rotuloSim);
    await renderizarProximo(fluxo, passoMap, passo.proximo_sim_id, passoId, 'proximo_sim_id', ramoSim);

    const ramoNao = document.createElement('div');
    ramoNao.className = 'fluxo-ramo';
    const rotuloNao = document.createElement('span');
    rotuloNao.className = 'fluxo-ramo-rotulo nao';
    rotuloNao.textContent = 'Não';
    ramoNao.appendChild(rotuloNao);
    await renderizarProximo(fluxo, passoMap, passo.proximo_nao_id, passoId, 'proximo_nao_id', ramoNao);

    ramos.appendChild(ramoSim);
    ramos.appendChild(ramoNao);
    container.appendChild(ramos);
  } else {
    const box = document.createElement('div');
    box.className = 'fluxo-no-processo';

    const textoEl = document.createElement('p');
    textoEl.className = 'fluxo-no-texto';
    textoEl.textContent = passo.texto;
    box.appendChild(textoEl);

    const nomeDoProcesso = await nomeProcesso(passo.processo_id);
    if (nomeDoProcesso) {
      const badge = document.createElement('button');
      badge.type = 'button';
      badge.className = 'badge-processo';
      badge.textContent = `📋 Consultar: ${nomeDoProcesso}`;
      badge.addEventListener('click', () => irParaProcesso(nomeDoProcesso));
      box.appendChild(badge);
    }

    const acoes = document.createElement('div');
    acoes.className = 'fluxo-no-acoes';
    acoes.appendChild(criarBotaoAcao('Editar', () => { passoEmEdicaoId = passoId; renderizarFluxos(); }));
    acoes.appendChild(criarBotaoAcao('Excluir', () => excluirPassoComDescendentes(fluxo.id, passoId), true));
    box.appendChild(acoes);

    container.appendChild(box);
    // Passos tipo 'acao' usam proximo_id que foi renomeado
    // Mas na estrutura original usava 'proximoId', agora usamos nenhum (linear)
    // Vou adicionar suporte para próximo passo linear
  }
}

function criarBotaoAcao(texto, aoClicar, ehPerigo) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = texto;
  if (ehPerigo) btn.className = 'fluxo-excluir-no';
  btn.addEventListener('click', aoClicar);
  return btn;
}

async function criarFluxoCard(fluxo) {
  const card = document.createElement('div');
  card.className = 'processo-card';
  const aberto = fluxoAbertoId === fluxo.id;

  const topo = document.createElement('div');
  topo.className = 'processo-topo';
  const nomeEl = document.createElement('p');
  nomeEl.className = 'processo-nome';
  nomeEl.textContent = fluxo.nome;
  topo.appendChild(nomeEl);
  card.appendChild(topo);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'btn-link historico-toggle';
  toggle.textContent = (aberto ? '▾ Esconder' : '▸ Ver') + ' fluxograma';
  toggle.addEventListener('click', () => alternarFluxo(fluxo.id));
  card.appendChild(toggle);

  if (aberto) {
    // Carregar passos do fluxo
    const passos = await carregarPassos(fluxo.id);
    const passoMap = {};
    passos.forEach(p => {
      passoMap[p.id] = p;
    });

    // Encontrar o passo de início (tipo 'inicio')
    const passoInicio = passos.find(p => p.tipo === 'inicio');

    const arvore = document.createElement('div');
    arvore.className = 'fluxo-arvore';
    arvore.appendChild(criarCaixaTerminal('Início', 'inicio'));
    if (passoInicio) {
      await renderizarProximo(fluxo, passoMap, passoInicio.proximo_sim_id || passoInicio.proximo_nao_id, null, 'proximo', arvore);
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fluxo-btn-add';
      btn.textContent = '+ Adicionar passo inicial';
      btn.addEventListener('click', () => {
        slotAberto = { fluxoId: fluxo.id, passoPaiId: null, campo: 'proximo_inicio' };
        renderizarFluxos();
      });
      arvore.appendChild(criarSeta());
      arvore.appendChild(btn);
      arvore.appendChild(criarSeta());
      arvore.appendChild(criarCaixaTerminal('Fim', 'fim'));
    }
    card.appendChild(arvore);
  }

  const acoesFluxo = document.createElement('div');
  acoesFluxo.className = 'processo-acoes';
  const btnExcluirFluxo = document.createElement('button');
  btnExcluirFluxo.className = 'btn-perigo';
  btnExcluirFluxo.textContent = 'Excluir fluxo';
  btnExcluirFluxo.addEventListener('click', () => excluirFluxo(fluxo.id));
  acoesFluxo.appendChild(btnExcluirFluxo);
  card.appendChild(acoesFluxo);

  return card;
}

async function renderizarFluxos() {
  const termoBusca = fluxoBuscaEl.value.trim().toLowerCase();
  const fluxosCarregados = await carregarFluxos();
  fluxos = fluxosCarregados;

  const filtrados = fluxos.filter(f => !termoBusca || f.nome.toLowerCase().includes(termoBusca));

  fluxoListaEl.innerHTML = '';

  if (filtrados.length === 0) {
    fluxoVazioEl.classList.remove('escondido');
    fluxoVazioEl.textContent = fluxos.length === 0
      ? 'Nenhum fluxo cadastrado ainda. Clique em "+ Novo fluxo" pra começar.'
      : 'Nenhum fluxo encontrado com esse filtro.';
  } else {
    fluxoVazioEl.classList.add('escondido');
    const filtradosOrdenados = filtrados.slice().sort((a, b) => a.nome.localeCompare(b.nome));
    for (const f of filtradosOrdenados) {
      const card = await criarFluxoCard(f);
      fluxoListaEl.appendChild(card);
    }
  }
}

fluxoBuscaEl.addEventListener('input', renderizarFluxos);

// ---------- Início ----------

renderizarFluxos();
