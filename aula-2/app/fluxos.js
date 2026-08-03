const CHAVE_STORAGE_FLUXOS = 'alprox_fluxos';

function carregarFluxos() {
  const dados = localStorage.getItem(CHAVE_STORAGE_FLUXOS);
  return dados ? JSON.parse(dados) : [];
}

function salvarFluxosStorage(lista) {
  localStorage.setItem(CHAVE_STORAGE_FLUXOS, JSON.stringify(lista));
}

function listarProcessosAtuais() {
  const dados = localStorage.getItem(CHAVE_STORAGE);
  return dados ? JSON.parse(dados) : [];
}

function nomeProcesso(processoId) {
  if (!processoId) return null;
  const p = listarProcessosAtuais().find(p => p.id === processoId);
  return p ? p.nome : null;
}

function gerarIdPasso() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 6);
}

let fluxos = carregarFluxos();
let fluxoAbertoId = null;
let slotAberto = null; // { fluxoId, passoPaiId, campo }
let passoEmEdicaoId = null;

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

fluxoForm.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const novoFluxo = {
    id: Date.now().toString(),
    nome: fluxoNomeEl.value.trim(),
    inicioId: null,
    passos: {}
  };
  fluxos.push(novoFluxo);
  salvarFluxosStorage(fluxos);
  fluxoForm.classList.add('escondido');
  fluxoForm.reset();
  fluxoAbertoId = novoFluxo.id;
  renderizarFluxos();
});

function excluirFluxo(id) {
  const confirmou = confirm('Tem certeza que quer excluir este fluxo inteiro?');
  if (!confirmou) return;
  fluxos = fluxos.filter(f => f.id !== id);
  salvarFluxosStorage(fluxos);
  renderizarFluxos();
}

function alternarFluxo(id) {
  fluxoAbertoId = fluxoAbertoId === id ? null : id;
  slotAberto = null;
  passoEmEdicaoId = null;
  renderizarFluxos();
}

// ---------- Adicionar / editar / excluir passo ----------

function adicionarPasso(fluxoId, passoPaiId, campo, dados) {
  const fluxo = fluxos.find(f => f.id === fluxoId);
  const novoId = gerarIdPasso();
  fluxo.passos[novoId] = {
    id: novoId,
    tipo: dados.tipo,
    texto: dados.texto.trim(),
    processoId: dados.tipo === 'processo' ? (dados.processoId || '') : '',
    proximoId: '',
    proximoSimId: '',
    proximoNaoId: ''
  };

  if (campo === 'inicio') {
    fluxo.inicioId = novoId;
  } else {
    fluxo.passos[passoPaiId][campo] = novoId;
  }

  salvarFluxosStorage(fluxos);
  slotAberto = null;
  renderizarFluxos();
}

function editarPasso(fluxoId, passoId, texto, processoId) {
  const fluxo = fluxos.find(f => f.id === fluxoId);
  const passo = fluxo.passos[passoId];
  passo.texto = texto.trim();
  if (passo.tipo === 'processo') passo.processoId = processoId || '';
  salvarFluxosStorage(fluxos);
  passoEmEdicaoId = null;
  renderizarFluxos();
}

function coletarDescendentes(fluxo, passoId, acumulado) {
  const passo = fluxo.passos[passoId];
  if (!passo) return;
  acumulado.push(passoId);
  if (passo.tipo === 'processo') {
    if (passo.proximoId) coletarDescendentes(fluxo, passo.proximoId, acumulado);
  } else {
    if (passo.proximoSimId) coletarDescendentes(fluxo, passo.proximoSimId, acumulado);
    if (passo.proximoNaoId) coletarDescendentes(fluxo, passo.proximoNaoId, acumulado);
  }
}

function excluirPasso(fluxoId, passoId) {
  const confirmou = confirm('Excluir este passo? Todos os passos que vêm depois dele (neste caminho) também serão excluídos.');
  if (!confirmou) return;

  const fluxo = fluxos.find(f => f.id === fluxoId);
  const paraExcluir = [];
  coletarDescendentes(fluxo, passoId, paraExcluir);

  if (fluxo.inicioId === passoId) fluxo.inicioId = null;
  Object.values(fluxo.passos).forEach(p => {
    if (p.proximoId === passoId) p.proximoId = '';
    if (p.proximoSimId === passoId) p.proximoSimId = '';
    if (p.proximoNaoId === passoId) p.proximoNaoId = '';
  });
  paraExcluir.forEach(id => delete fluxo.passos[id]);

  salvarFluxosStorage(fluxos);
  renderizarFluxos();
}

// ---------- Ir para o processo relacionado ----------

function irParaProcesso(nomeDoProcesso) {
  mudarTela('tela-processos');
  buscaEl.value = nomeDoProcesso;
  renderizarLista();
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

function criarSelectProcessos(valorAtual) {
  const select = document.createElement('select');
  select.innerHTML = '<option value="">Nenhum processo relacionado</option>';
  listarProcessosAtuais().filter(p => p.status !== 'inativo').forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.nome;
    select.appendChild(opt);
  });
  if (valorAtual) select.value = valorAtual;
  return select;
}

function criarFormPasso({ modo, fluxoId, passoPaiId, campo, passoExistente, aoCancelar }) {
  const form = document.createElement('form');
  form.className = 'fluxo-form-passo';
  form.addEventListener('submit', (e) => e.preventDefault());

  const campoTipo = document.createElement('div');
  campoTipo.className = 'campo';
  campoTipo.innerHTML = '<label>Tipo de passo</label>';
  const selectTipo = document.createElement('select');
  selectTipo.innerHTML = '<option value="processo">Ação (o que fazer)</option><option value="decisao">Decisão (pergunta sim/não)</option>';
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
  campoProcesso.innerHTML = '<label>Processo relacionado (opcional)</label>';
  const selectProcesso = criarSelectProcessos(passoExistente ? passoExistente.processoId : '');
  campoProcesso.appendChild(selectProcesso);

  const atualizarVisibilidadeProcesso = () => {
    campoProcesso.style.display = selectTipo.value === 'processo' ? 'flex' : 'none';
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
  btnSalvar.addEventListener('click', () => {
    if (!inputTexto.value.trim()) { inputTexto.focus(); return; }
    if (modo === 'editar') {
      editarPasso(fluxoId, passoExistente.id, inputTexto.value, selectProcesso.value);
    } else {
      adicionarPasso(fluxoId, passoPaiId, campo, {
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

function renderizarProximo(fluxo, passoId, passoPaiId, campo, container) {
  container.appendChild(criarSeta());

  if (passoId && fluxo.passos[passoId]) {
    renderizarNo(fluxo, passoId, container);
    return;
  }

  if (slotEstaAberto(fluxo.id, passoPaiId, campo)) {
    container.appendChild(criarFormPasso({
      modo: 'novo',
      fluxoId: fluxo.id,
      passoPaiId,
      campo,
      aoCancelar: () => { slotAberto = null; renderizarFluxos(); }
    }));
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

function renderizarNo(fluxo, passoId, container) {
  const passo = fluxo.passos[passoId];

  if (passoEmEdicaoId === passoId) {
    container.appendChild(criarFormPasso({
      modo: 'editar',
      fluxoId: fluxo.id,
      passoExistente: passo,
      aoCancelar: () => { passoEmEdicaoId = null; renderizarFluxos(); }
    }));
    return;
  }

  if (passo.tipo === 'decisao') {
    const wrap = document.createElement('div');
    wrap.className = 'fluxo-no-decisao-wrap';
    wrap.innerHTML = '<div class="fluxo-no-decisao"></div>';
    const textoEl = document.createElement('div');
    textoEl.className = 'fluxo-no-decisao-texto';
    textoEl.textContent = passo.texto;
    wrap.appendChild(textoEl);
    container.appendChild(wrap);

    const acoes = document.createElement('div');
    acoes.className = 'fluxo-no-acoes';
    acoes.appendChild(criarBotaoAcao('Editar', () => { passoEmEdicaoId = passoId; renderizarFluxos(); }));
    acoes.appendChild(criarBotaoAcao('Excluir', () => excluirPasso(fluxo.id, passoId), true));
    container.appendChild(acoes);

    const ramos = document.createElement('div');
    ramos.className = 'fluxo-ramos';

    const ramoSim = document.createElement('div');
    ramoSim.className = 'fluxo-ramo';
    const rotuloSim = document.createElement('span');
    rotuloSim.className = 'fluxo-ramo-rotulo sim';
    rotuloSim.textContent = 'Sim';
    ramoSim.appendChild(rotuloSim);
    renderizarProximo(fluxo, passo.proximoSimId, passoId, 'proximoSimId', ramoSim);

    const ramoNao = document.createElement('div');
    ramoNao.className = 'fluxo-ramo';
    const rotuloNao = document.createElement('span');
    rotuloNao.className = 'fluxo-ramo-rotulo nao';
    rotuloNao.textContent = 'Não';
    ramoNao.appendChild(rotuloNao);
    renderizarProximo(fluxo, passo.proximoNaoId, passoId, 'proximoNaoId', ramoNao);

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

    const nomeDoProcesso = nomeProcesso(passo.processoId);
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
    acoes.appendChild(criarBotaoAcao('Excluir', () => excluirPasso(fluxo.id, passoId), true));
    box.appendChild(acoes);

    container.appendChild(box);
    renderizarProximo(fluxo, passo.proximoId, passoId, 'proximoId', container);
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

function criarFluxoCard(fluxo) {
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
    const arvore = document.createElement('div');
    arvore.className = 'fluxo-arvore';
    arvore.appendChild(criarCaixaTerminal('Início', 'inicio'));
    renderizarProximo(fluxo, fluxo.inicioId, null, 'inicio', arvore);
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

function renderizarFluxos() {
  const termoBusca = fluxoBuscaEl.value.trim().toLowerCase();
  const filtrados = fluxos.filter(f => !termoBusca || f.nome.toLowerCase().includes(termoBusca));

  fluxoListaEl.innerHTML = '';

  if (filtrados.length === 0) {
    fluxoVazioEl.classList.remove('escondido');
    fluxoVazioEl.textContent = fluxos.length === 0
      ? 'Nenhum fluxo cadastrado ainda. Clique em "+ Novo fluxo" pra começar.'
      : 'Nenhum fluxo encontrado com esse filtro.';
  } else {
    fluxoVazioEl.classList.add('escondido');
    filtrados
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .forEach(f => fluxoListaEl.appendChild(criarFluxoCard(f)));
  }
}

fluxoBuscaEl.addEventListener('input', renderizarFluxos);

// ---------- Início ----------

renderizarFluxos();
