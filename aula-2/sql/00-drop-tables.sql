-- Script para deletar todas as tabelas alprox_ (ordem reversa por FK)
-- Execute ANTES de rodar 01-init-supabase.sql

DROP TABLE IF EXISTS alprox_certificados CASCADE;
DROP TABLE IF EXISTS alprox_certidoes CASCADE;
DROP TABLE IF EXISTS alprox_prazos CASCADE;
DROP TABLE IF EXISTS alprox_tarefas_equipe CASCADE;
DROP TABLE IF EXISTS alprox_tarefas_pessoais CASCADE;
DROP TABLE IF EXISTS alprox_passos_fluxo CASCADE;
DROP TABLE IF EXISTS alprox_fluxos CASCADE;
DROP TABLE IF EXISTS alprox_historico_clientes CASCADE;
DROP TABLE IF EXISTS alprox_clientes CASCADE;
DROP TABLE IF EXISTS alprox_processos CASCADE;
DROP TABLE IF EXISTS alprox_colaboradores CASCADE;

-- Confirmar
SELECT 'Todas as tabelas alprox_ foram deletadas!' as status;
