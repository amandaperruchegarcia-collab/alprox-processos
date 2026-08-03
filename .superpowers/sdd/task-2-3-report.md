# Task 2.3 — Refatorar minhas-tarefas.js (localStorage → Supabase)

**Status:** ✅ DONE

---

## Resumo da Refatoração

Refatoração concluída com sucesso de `aula-2/app/minhas-tarefas.js` de localStorage para Supabase. Todas as operações CRUD foram migradas para usar a tabela `alprox_s_s_is` com isolamento por `usuario_id`.

---

## Mudanças Realizadas

### 1. Funções CRUD Refatoradas ✅

**Antes:** localStorage (síncrono)
**Depois:** Supabase (async/await)

#### `carregarTarefas()` → async
- Antes: `localStorage.getItem('alprox_minhas_tarefas')`
- Depois: `supabase.from('alprox_s_s_is').select('*').eq('usuario_id', window.usuario_id)`
- Ordenação: Por `prazo` (ascending, nulls last)
- Tratamento de erro: Retorna array vazio se erro

#### `salvarTarefa(tarefa)` → async
- Antes: Push local + localStorage.setItem
- Depois: `supabase.from('alprox_s_s_is').insert({...})`
- Campos inseridos:
  - `usuario_id` (auto from window.usuario_id)
  - `titulo`, `descricao`, `prazo`, `status`
- Lança exceção se erro

#### `atualizarTarefa(id, tarefaAtualizada)` → async
- Antes: Find + mutação + localStorage.setItem
- Depois: `supabase.from('alprox_s_s_is').update({...}).eq('id', id).eq('usuario_id', window.usuario_id)`
- Filtra por ID e usuario_id (segurança)
- Atualiza campo `atualizado_em` automaticamente

#### `deletarTarefa(id)` → async
- Antes: Filter + localStorage.setItem
- Depois: `supabase.from('alprox_s_s_is').delete().eq('id', id).eq('usuario_id', window.usuario_id)`
- Filtra por ID e usuario_id (segurança)

### 2. Funções de Status → async ✅

#### `mudarStatusTarefa(id, novoStatus)` → async
- Agora chama `atualizarTarefa()` com async/await
- Recarrega lista após sucesso
- Trata erros com try/catch + alert

#### `excluirTarefa(id)` → async
- Mantém confirmação do usuário
- Chama `deletarTarefa()` com async/await
- Recarrega lista após sucesso
- Trata erros com try/catch + alert

### 3. Event Listeners Refatorados ✅

#### Form submit
- Antes: `addEventListener('submit', (evento) => { ... })`
- Depois: `addEventListener('submit', async (evento) => { ... })`
- Agora com try/catch e await nas operações Supabase

#### Mudar status (select)
- Antes: `addEventListener('change', (e) => mudarStatusTarefa(...))`
- Depois: `addEventListener('change', async (e) => { await mudarStatusTarefa(...) })`

#### Excluir (botão)
- Antes: `addEventListener('click', () => excluirTarefa(...))`
- Depois: `addEventListener('click', async () => { await excluirTarefa(...) })`

### 4. Inicialização Refatorada ✅

#### Função auxiliar criada: `atualizarListaTarefas()` → async
- Carrega tarefas via Supabase
- Renderiza na tela
- Centraliza lógica de recarregar

#### Inicialização segura: `inicializarTarefas()` → async
- Verifica autenticação (`window.usuario_id`)
- Aguarda autenticação se não pronto
- Listener para `usuario-logado` event
- Compatível com DOMContentLoaded

---

## Tabela Supabase Usada

**Tabela:** `alprox_s_s_is` (tabela pessoal, usuario_id isolado)

**Campos mapeados:**
```javascript
{
  id:              UUID (auto-generated)
  usuario_id:      UUID (from window.usuario_id, obrigatório)
  titulo:          text (obrigatório)
  descricao:       text (opcional)
  prazo:           date YYYY-MM-DD (opcional)
  status:          'a-fazer' | 'fazendo' | 'feito' (default: 'a-fazer')
  criado_em:       timestamp (auto-generated)
  atualizado_em:   timestamp (auto-updated)
}
```

---

## Filtro usuario_id ✅

Implementado em todas as operações:

1. **SELECT:** `.eq('usuario_id', window.usuario_id)` — usuário só vê suas tarefas
2. **INSERT:** `usuario_id: window.usuario_id` — tarefas criadas com seu ID
3. **UPDATE:** `.eq('usuario_id', window.usuario_id)` — só pode editar suas tarefas
4. **DELETE:** `.eq('usuario_id', window.usuario_id)` — só pode deletar suas tarefas

Segurança garantida no nível da aplicação (complementa RLS do Supabase).

---

## Testes Locais (Manual Checklist)

Para testar localmente:

```bash
# 1. Verificar autenticação
# Garantir que window.supabase e window.usuario_id estão disponíveis

# 2. Testar CRUD
# - Criar tarefa: Form → Supabase → Render
# - Editar tarefa: Editar → Supabase → Render
# - Mudar status: Select → Supabase → Render
# - Deletar tarefa: Confirmar → Supabase → Render

# 3. Testar persistência
# - F5 (reload) → tarefas recarregam do Supabase

# 4. Testar isolamento
# - Login com user A → ver tarefas de A
# - Logout → Login com user B → ver tarefas de B (não de A)
```

**Status:** ✅ Pronto para testes manuais no preview
- Arquivo refatorado: `aula-2/app/minhas-tarefas.js`
- Sem erros de sintaxe JavaScript
- Compatível com supabase-js v2

---

## Bloqueadores

**Nenhum bloqueador identificado.**

Dependências satisfeitas:
- ✅ `window.supabase` (cliente Supabase)
- ✅ `window.usuario_id` (ID do usuário autenticado)
- ✅ Tabela `alprox_s_s_is` existe no Supabase
- ✅ RLS policies configuradas (Task 1.3)

---

## Diferenças de Comportamento

| Aspecto | localStorage | Supabase |
|---------|--------------|----------|
| **Persistência** | Local (dispositivo) | Servidor |
| **Sincronização** | Nenhuma | Automática com server |
| **Compartilhamento** | Não (localStorage é isolado) | Sim (dados no server) |
| **Offset** | Imediato | Latência de rede (~100ms) |
| **Isolamento** | Por navegador | Por usuario_id + RLS |

---

## Próximos Passos

1. **Task 2.4:** Refatorar `tarefas-equipe.js` (mesmo padrão, tabela: `tarefas_equipe`)
2. **Task 2.5-2.10:** Refatorar outros módulos (prazos, certidões, certificados, clientes, fluxos, dashboard)
3. **Task 3.1-3.2:** Implementar login e migração automática
4. **Task 4-5:** Deploy na Vercel e PWA

---

**Refactoring concluído com sucesso em 2026-08-03**
