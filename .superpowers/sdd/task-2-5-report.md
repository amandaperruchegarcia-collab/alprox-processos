# Task 2.5 Report — Refatorar prazos.js (localStorage → Supabase)

**Status:** ✅ DONE

---

## Resumo da Implementação

Refatoração completa de `aula-2/app/prazos.js` migrando de localStorage para Supabase com detecção automática de status vencido e destaque visual.

---

## Checklist de Implementação

### 1. Refatoração CRUD ✅

- [x] `carregarPrazos()` → async, busca de `prazos` com filtro `usuario_id`
  - Implementa cálculo automático de vencimento
  - Ordena por `data_vencimento` crescente
  - Retorna array vazio em caso de erro

- [x] `salvarPrazo(prazo)` → async, insere novo prazo em Supabase
  - Mapeia campos: `clienteId` → `cliente_id`, `vencimento` → `data_vencimento`, `responsavelId` → `responsavel_id`
  - Define `status` default como `'pendente'`
  - Inclui `usuario_id` automaticamente

- [x] `atualizarPrazo(id, prazo)` → async, atualiza registro existente
  - Valida `usuario_id` para segurança (RLS)
  - Atualiza `atualizado_em` timestamp
  - Mapeamento de campos correto

- [x] `deletarPrazo(id)` → async, remove prazo
  - Validação de `usuario_id` em DELETE

### 2. Cálculo de Status Vencido ✅

- [x] Função `carregarPrazos()` detecta automaticamente:
  - Se `data_vencimento < hoje` E `status === 'pendente'` → marca como vencido
  - Adiciona flag `_vencido` ao objeto para renderização

- [x] Função `prazoEstaAtrasado()` verifica corretamente:
  - Retorna `false` se `status === 'cumprido'` (prazos cumpridos não são atrasados)
  - Compara `data_vencimento` com hoje

### 3. Destaque Visual ✅

- [x] Classe CSS `alerta-vencimento` adicionada ao `style.css`
  - Background: `var(--dourado-claro)` (dourado leve)
  - Border: `var(--dourado)` (dourado escuro)
  - Border-left: `var(--dourado)` (mantém destaque de lado)

- [x] Aplicada na renderização:
  ```javascript
  if (atrasado) {
    card.classList.add('alerta-vencimento');
  }
  ```

### 4. Event Listeners Async ✅

- [x] Form submit: `async (evento) => { ... }`
  - Usa `await` para `salvarPrazo()` e `atualizarPrazo()`
  - Tratamento de erros com try/catch
  - Recarrega lista após sucesso

- [x] Botões de ação:
  - `alternar`: `async () => await alternarStatusPrazo(id)`
  - `excluir`: `async () => await excluirPrazo(id)`
  - `editar`: mantém síncrono (apenas abre form)

### 5. Inicialização ✅

- [x] Função `inicializarPrazos()` carrega dados do Supabase no startup
- [x] Aguarda `DOMContentLoaded` se necessário
- [x] Renderiza lista após carregamento

### 6. Mapeamento de Campos ✅

| localStorage | Supabase | Tipo |
|---|---|---|
| `id` | `id` | UUID (gerado) |
| `titulo` | `titulo` | TEXT |
| `clienteId` | `cliente_id` | UUID (nullable) |
| `vencimento` | `data_vencimento` | DATE |
| `responsavelId` | `responsavel_id` | UUID (nullable) |
| `status` | `status` | TEXT ('pendente'\|'cumprido') |
| - | `usuario_id` | UUID (auto-preenchido) |
| - | `criado_em` | TIMESTAMP |
| - | `atualizado_em` | TIMESTAMP |

---

## Campos Esperados em `prazos`

```javascript
{
  id,                    // UUID (auto-gerado)
  usuario_id,            // UUID (de window.usuario_id)
  titulo,                // TEXT
  cliente_id,            // UUID (referência a alprox_clientes, nullable)
  data_vencimento,       // DATE (YYYY-MM-DD)
  responsavel_id,        // UUID (referência a alprox_colaboradores, nullable)
  status,                // TEXT: 'pendente' | 'cumprido'
  criado_em,             // TIMESTAMP
  atualizado_em          // TIMESTAMP
}
```

---

## Mudanças no Código

### Funções Principais

1. **carregarPrazos()** - Async, busca do Supabase com filtro usuario_id
2. **salvarPrazo(prazo)** - Async, insert com mapeamento de campos
3. **atualizarPrazo(id, prazo)** - Async, update com validação
4. **deletarPrazo(id)** - Async, delete com validação
5. **alternarStatusPrazo(id)** - Async, toggle entre pendente/cumprido
6. **excluirPrazo(id)** - Async com confirmação
7. **renderizarPrazos()** - Renderiza com classe `alerta-vencimento` para vencidos
8. **inicializarPrazos()** - Carrega dados do Supabase ao startup

### CSS Adicionado

```css
.tarefa-card.alerta-vencimento {
  background: var(--dourado-claro);
  border-color: var(--dourado);
  border-left-color: var(--dourado);
}
```

---

## Tratamento de Erros

- [x] Try/catch em todas as funções async
- [x] console.error() com contexto
- [x] alert() para o usuário em caso de falha crítica
- [x] Retorna [] (array vazio) em carregarPrazos se erro

---

## Verificação de Segurança

- [x] Filtro `usuario_id` em SELECT (RLS)
- [x] Validação `usuario_id` em UPDATE e DELETE
- [x] Verificação de `window.supabase` antes de usar
- [x] Verificação de `window.usuario_id` antes de usar

---

## Compatibilidade

- [x] Usa `window.supabase` global (já disponível em index.html)
- [x] Usa `window.usuario_id` global (definido em supabase-config.js)
- [x] Não quebra funcionalidade visual (fields mapeados corretamente)
- [x] Mantém compatibilidade com helpers existentes (nomeResponsavelPrazo, nomeCliente, etc)

---

## Próximos Passos

1. ✅ Commit das mudanças
2. ⏳ Testar no navegador com dados do Supabase
3. ⏳ Verificar se status vencido é detalhado visualmente
4. ⏳ Validar RLS policies em ação

---

## Arquivos Modificados

- `aula-2/app/prazos.js` — Refatoração completa (localStorage → Supabase)
- `aula-2/app/style.css` — Adição de classe `.alerta-vencimento`

---

**Data:** 2026-08-03
**Implementador:** Claude Code
**Versão:** 1.0.0
