# Refatoração de Módulos (Fase 2: Task 2.2-2.10)

## Mapeamento de Módulos → Tabelas Supabase

| Task | Arquivo JS | Tabela Supabase | Tipo | Status |
|---|---|---|---|---|
| 2.2 | processos.js | alprox_processos | Compartilhada | ⏳ Em progresso |
| 2.3 | minhas-tarefas.js | alprox_s_s_is | Pessoal | ⏳ Em fila |
| 2.4 | tarefas-equipe.js | alprox_2s_equipe | Pessoal | ⏳ Em fila |
| 2.5 | prazos.js | alprox_prazos | Pessoal | ⏳ Em fila |
| 2.6 | certidoes.js | alprox_certidoes | Pessoal | ⏳ Em fila |
| 2.7 | certificados.js | alprox_certificados | Pessoal | ⏳ Em fila |
| 2.8 | clientes.js | alprox_clientes + alprox_historico_clientes | Compartilhada | ⏳ Em fila |
| 2.9 | fluxos.js | alprox_fluxos + alprox_passos_fluxo | Compartilhada | ⏳ Em fila |
| 2.10 | dashboard.js | Lê de todas (sem inserção) | N/A | ⏳ Em fila |

## Padrão de Refatoração

### Tabelas Compartilhadas (Processos, Clientes, Fluxos)
```javascript
// ANTES (localStorage)
function carregarXXX() {
  return JSON.parse(localStorage.getItem('xxx') || '[]');
}

// DEPOIS (Supabase)
async function carregarXXX() {
  const { data, error } = await window.supabase
    .from('alprox_xxx')
    .select('*');
  if (error) throw error;
  return data || [];
}
```

### Tabelas Pessoais (Tarefas, Prazos, Certidões, Certificados)
```javascript
// Adicionar filtro por usuario_id
async function carregarXXX() {
  const { data, error } = await window.supabase
    .from('alprox_xxx')
    .select('*')
    .eq('usuario_id', window.usuario_id);
  if (error) throw error;
  return data || [];
}
```

### Tabelas de Tarefas da Equipe
```javascript
// Lógica especial: criado_por OR atribuido_para
async function carregarXXX() {
  const { data, error } = await window.supabase
    .from('alprox_2s_equipe')
    .select('*')
    .or(`criado_por.eq.${window.usuario_id},atribuido_para.eq.${window.usuario_id}`);
  if (error) throw error;
  return data || [];
}
```

## Status de Progresso

- ✅ **Fase 1:** Setup Supabase (3/3 tasks completas)
- ⏳ **Fase 2:** Refatorar Frontend (1/9 tasks em execução)
  - Task 2.1: ✅ COMPLETE (helpers de Supabase)
  - Task 2.2: ⏳ Em progresso (processos.js)
  - Task 2.3-2.10: ⏳ Em fila

## Próximas Etapas

1. **Após Task 2.10:** Fase 3 (Login + Migração de dados)
2. **Após Fase 3:** Fase 4 (Vercel Deploy)
3. **Após Fase 4:** Fase 5 (PWA)

---

**Nota:** Nomes de tabelas com diferenças:
- `alprox_tarefas_pessoais` → real: `alprox_s_s_is`
- `alprox_tarefas_equipe` → real: `alprox_2s_equipe`
