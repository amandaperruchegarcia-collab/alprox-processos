# Mapeamento de Tabelas — Alprox Processos

## Tabelas Existentes no Supabase

| Nome no Plan | Nome Real (Supabase) | Status |
|---|---|---|
| alprox_colaboradores | alprox_colaboradores | ✅ |
| alprox_processos | alprox_processos | ✅ |
| alprox_clientes | alprox_clientes | ✅ |
| alprox_historico_clientes | alprox_historico_clientes | ✅ |
| alprox_fluxos | alprox_fluxos | ✅ |
| alprox_passos_fluxo | alprox_passos_fluxo | ✅ |
| alprox_tarefas_pessoais | **alprox_s_s_is** | ⚠️ Nome diferente |
| alprox_tarefas_equipe | **alprox_2s_equipe** | ⚠️ Nome diferente |
| alprox_prazos | alprox_prazos | ✅ |
| alprox_certidoes | alprox_certificados | ⚠️ Nomes similares |
| alprox_certificados | alprox_certificados | ⚠️ Possível duplicada |

## Próximas Steps

1. **Task 1.2:** Criar conta admin no Supabase
2. **Task 1.3:** Ativar RLS policies (usando nomes reais)
3. **Fase 2:** Refatorar JavaScript com os nomes corretos

## Nota

Os nomes das tabelas `alprox_tarefas_pessoais` e `alprox_tarefas_equipe` foram criados com nomes diferentes no Supabase. Ao refatorar o código JavaScript, use os nomes reais (alprox_s_s_is, alprox_2s_equipe).
