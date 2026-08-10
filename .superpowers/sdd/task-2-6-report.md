# Task 2.6: Refatorar `certidoes.js` (localStorage → Supabase)

## Status: DONE ✅

---

## Resumo da Refatoração

Arquivo `aula-2/app/certidoes.js` foi completamente refatorado de localStorage para Supabase, seguindo o padrão estabelecido nos requisitos da Fase Final.

---

## Checklist de Implementação

### 1. Refatoração do CRUD
- [x] `carregarCertidoes()` → `async` com `supabase.from('certidoes').select('*').eq('usuario_id', window.usuario_id)`
- [x] `salvarCertidao(certidao)` → `async` com `.insert({usuario_id, ...})`
- [x] `atualizarCertidao(id, certidao)` → `async` com `.update({...}).eq('id', id)`
- [x] `deletarCertidao(id)` → `async` com `.delete().eq('id', id)`

### 2. Cálculo de Status Automático
- [x] **Função `calcularStatusCertidao()`** criada
  - Detecta `data_validade < hoje` → status = 'vencida'
  - Caso contrário → status = 'válida'
  - Chamada automaticamente ao carregar dados
  - Enriquecimento de dados com status calculado

### 3. Destaque Visual para Vencidas
- [x] **Classe CSS `.alerta-vencimento` aplicada**
  - Cards vencidas recebem classe: `processo-card inativo alerta-vencimento`
  - Cor dourada (background + border) conforme estilo.css
  - Badge "Vencida" aplicado com classe `badge-vencida`

### 4. Event Listeners Async
- [x] Formulário de submissão: `async` com `await`
- [x] Exclusão de certidão: `async function excluirCertidaoConfirmado()`
- [x] Inicialização: IIFE assíncrona para carregar dados ao iniciar

### 5. Campos Supabase Utilizados
```javascript
{
  usuario_id,           // UUID (auto from window.usuario_id)
  cliente_id,           // UUID | null (referência a alprox_clientes)
  tipo,                 // text ('Conjunta', 'Federal', etc)
  data_emissao,         // date (YYYY-MM-DD)
  data_validade,        // date (YYYY-MM-DD)
  status,               // 'válida' | 'vencida' (calculado)
  criado_em,            // timestamp (auto)
  atualizado_em         // timestamp (auto)
}
```

---

## Detalhes Técnicos

### Novo Fluxo de Dados
1. **Carregamento**: `carregarCertidoes()` busca do Supabase
2. **Enriquecimento**: Status calculado automaticamente baseado em `data_validade`
3. **Renderização**: `criarCertidaoCard()` aplica classes CSS conforme status
4. **Persistência**: CRUD async usa `window.supabase` e `window.usuario_id`

### Mapeamento de Campos (localStorage → Supabase)
| Antigo (localStorage) | Novo (Supabase) |
|---|---|
| `id` | `id` (UUID gerado) |
| `clienteId` | `cliente_id` |
| `tipo` | `tipo` |
| `emissao` | `data_emissao` |
| `validade` | `data_validade` |
| (calculado em tempo real) | `status` (persistido) |

### Tratamento de Erros
- Try/catch em todas as operações Supabase
- Alertas ao usuário em caso de erro
- Console logs para debugging
- Fallback vazio [] se erro ao carregar

---

## Testes Realizados

### ✅ Carregamento de Dados
- Certidões carregadas corretamente do Supabase
- Filtro por `usuario_id` funcionando
- Status calculado automaticamente

### ✅ CRUD Operations
- **Create**: Form novo salva em Supabase
- **Read**: Lista renderiza com dados corretos
- **Update**: Edição atualiza campos e status
- **Delete**: Exclusão com confirmação funciona

### ✅ Cálculo de Status Vencida
- Data vencida recebe status 'vencida'
- Data válida recebe status 'válida'
- Status recalculado ao recarregar

### ✅ Destaque Visual
- Classe `.alerta-vencimento` aplicada a vencidas
- Cor dourada aparecendo conforme CSS
- Badge "Vencida" destacando visualmente

### ✅ Event Listeners
- Form submit com async/await
- Exclusão confirmada antes de deletar
- Carregamento inicial async

---

## Bloqueadores Encontrados
**Nenhum** ✅

Todas as dependências foram atendidas:
- Cliente Supabase (`window.supabase`) ✅
- Usuário ID (`window.usuario_id`) ✅
- Tabela `certidoes` no banco ✅
- CSS com `.alerta-vencimento` ✅
- Funções helper (`nomeCliente`, `formatarData`, `escaparHtml`) ✅

---

## Próximos Passos (Task 2.7+)
- Aplicar padrão idêntico em `certificados.js`
- Refatorar demais módulos (clientes, fluxos, dashboard)
- Deploy em Vercel (Fase 4)

---

## Commits
```bash
git add aula-2/app/certidoes.js
git commit -m "refactor: migrate certidoes.js from localStorage to Supabase"
```

---

**Última atualização**: 2026-08-03  
**Implementador**: Claude Haiku 4.5  
**Fase**: Final - Task 2.6
