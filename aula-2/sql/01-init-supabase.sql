-- Alprox Processos: Supabase Database Schema
-- Execute este script no Supabase SQL Editor
-- Projeto: https://aefiardlggehjlnrjavz.supabase.co

-- Tabela: alprox_colaboradores (usuários do sistema)
CREATE TABLE alprox_colaboradores (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cargo TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: processos (compartilhada)
CREATE TABLE alprox_processos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  departamento TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  link_drive TEXT NOT NULL,
  link_youtube TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  observacoes TEXT,
  criado_por UUID NOT NULL REFERENCES alprox_colaboradores(id),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: clientes (compartilhada)
CREATE TABLE alprox_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_empresa TEXT NOT NULL,
  cnpj TEXT,
  contato TEXT,
  responsavel TEXT,
  observacoes TEXT,
  criado_por UUID NOT NULL REFERENCES alprox_colaboradores(id),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: historico_clientes
CREATE TABLE alprox_historico_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES alprox_clientes(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  anotacao TEXT NOT NULL,
  criado_por UUID NOT NULL REFERENCES alprox_colaboradores(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: fluxos (compartilhada)
CREATE TABLE alprox_fluxos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  criado_por UUID NOT NULL REFERENCES alprox_colaboradores(id),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: passos_fluxo
CREATE TABLE alprox_passos_fluxo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fluxo_id UUID NOT NULL REFERENCES alprox_fluxos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('acao', 'decisao', 'inicio', 'fim')),
  texto TEXT,
  processo_id UUID REFERENCES alprox_processos(id),
  ordem INTEGER NOT NULL,
  proximo_sim_id UUID REFERENCES alprox_passos_fluxo(id),
  proximo_nao_id UUID REFERENCES alprox_passos_fluxo(id),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: tarefas_pessoais (pessoal)
CREATE TABLE alprox_tarefas_pessoais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  prazo DATE,
  status TEXT DEFAULT 'a-fazer' CHECK (status IN ('a-fazer', 'fazendo', 'feito')),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: tarefas_equipe (pessoal)
CREATE TABLE alprox_tarefas_equipe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_por UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  atribuido_para UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  prazo DATE,
  status TEXT DEFAULT 'a-fazer' CHECK (status IN ('a-fazer', 'fazendo', 'feito')),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: prazos (pessoal)
CREATE TABLE alprox_prazos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  cliente_id UUID REFERENCES alprox_clientes(id),
  data_vencimento DATE NOT NULL,
  responsavel_id UUID REFERENCES alprox_colaboradores(id),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'cumprido')),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: certidoes (pessoal)
CREATE TABLE alprox_certidoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES alprox_clientes(id),
  tipo TEXT NOT NULL,
  data_emissao DATE NOT NULL,
  data_validade DATE NOT NULL,
  status TEXT DEFAULT 'válida',
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: certificados (pessoal)
CREATE TABLE alprox_certificados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES alprox_clientes(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('e-CNPJ', 'e-CPF')),
  data_emissao DATE NOT NULL,
  data_validade DATE NOT NULL,
  responsavel_id UUID REFERENCES alprox_colaboradores(id),
  status TEXT DEFAULT 'válido',
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Criar índices pra performance
CREATE INDEX idx_alprox_processos_status ON alprox_processos(status);
CREATE INDEX idx_alprox_clientes_nome ON alprox_clientes(nome_empresa);
CREATE INDEX idx_alprox_tarefas_pessoais_usuario ON alprox_tarefas_pessoais(usuario_id);
CREATE INDEX idx_alprox_tarefas_equipe_atribuido ON alprox_tarefas_equipe(atribuido_para);
CREATE INDEX idx_alprox_prazos_usuario ON alprox_prazos(usuario_id);
CREATE INDEX idx_alprox_certidoes_usuario ON alprox_certidoes(usuario_id);
CREATE INDEX idx_alprox_certificados_usuario ON alprox_certificados(usuario_id);
