# Alprox Processos — Fase Final: Publicar Implementation Plan

> **Para execução:** Use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para rodar task-by-task. Cada step usa checkbox `- [ ]` pra rastrear progresso.

**Objetivo:** Publicar o app Alprox Processos com autenticação multiusuário (Supabase), banco de dados na nuvem, deploy na Vercel e instalação como PWA.

**Arquitetura:** Frontend HTML/CSS/JS puro → Vercel (estático) conecta via `supabase-js` → Supabase (auth + PostgreSQL). Dados compartilhados (Processos, Clientes, Fluxos) com RLS read-only para usuários normais; dados pessoais (Tarefas, Prazos) isolados por `usuario_id`. Migração automática localStorage → Supabase na primeira vez.

**Tech Stack:** 
- Frontend: HTML/CSS/JS vanilla + supabase-js (CDN)
- Backend: Supabase (Auth + PostgreSQL + RLS)
- Hosting: Vercel (static files) + GitHub (CI/CD)
- PWA: manifest.json + meta tags

## Global Constraints

- Manter HTML/CSS/JS puro (sem React, Next.js, frameworks)
- RLS policies obrigatórios em todas as tabelas (segurança)
- Todas as senhas/chaves em variáveis de ambiente (não commitir)
- Compatibilidade PWA: iOS Safari + Android Chrome
- Nenhum request bloqueado por CORS (Supabase com CORS aberto por padrão)

---

## Estrutura de Arquivos (Antes → Depois)

**Arquivos criados:**
```
aula-2/app/
  supabase-config.js          (conecta ao Supabase via CDN)
  login.js                    (tela de login + autenticação)
  migration.js                (localStorage → Supabase)
  manifest.json               (PWA)

aula-2/ (root)
  vercel.json                 (config Vercel)
  package.json                (metadados pra Vercel reconhecer)
  .gitignore                  (não commitir .env)
  .env.example                (template das variáveis)
  PLANO-IMPLEMENTACAO-FASE-FINAL.md (este arquivo)
```

**Arquivos refatorados:**
```
aula-2/app/
  index.html                  (adiciona tela login + meta PWA)
  app.js                      (adiciona auth check)
  processos.js                (localStorage → supabase)
  tarefas-equipe.js           (localStorage → supabase)
  minhas-tarefas.js           (localStorage → supabase)
  prazos.js                   (localStorage → supabase)
  certidoes.js                (localStorage → supabase)
  certificados.js             (localStorage → supabase)
  clientes.js                 (localStorage → supabase)
  fluxos.js                   (localStorage → supabase)
  dashboard.js                (localStorage → supabase)
```

---

# FASE 1: Supabase Setup + Banco de Dados

## Task 1.1: Criar projeto Supabase e tabelas compartilhadas

**Arquivos:**
- Criar: `aula-2/sql/01-init-supabase.sql` (script SQL)
- Criar: `aula-2/sql/02-rls-policies.sql` (RLS policies)
- Referência: `DESIGN-FASE-FINAL.md` seção 4

**Interfaces:**
- Produz: Tabelas vazias no Supabase prontas pra receber dados
- Próxima task consome: URL + chave anon do projeto

**Steps:**

- [ ] **Step 1: Acessar Supabase e criar projeto**

1. Ir pra https://app.supabase.com
2. Fazer login (ou criar conta)
3. Clique em **New Project**
4. Nome: `alprox-processos`
5. Região: São Paulo (ou a mais próxima)
6. Password: salve em lugar seguro (vai precisar depois)
7. Clique **Create new project** → espera ~2 min

- [ ] **Step 2: Copiar credenciais do projeto**

Após criação, você verá a página do projeto. No menu esquerdo, **Settings > API**:
- Copie `Project URL` → guardar como `VITE_SUPABASE_URL`
- Copie `anon public` key → guardar como `VITE_SUPABASE_ANON_KEY`
- (Vamos precisar desses valores mais tarde)

- [ ] **Step 3: Criar tabelas compartilhadas**

No Supabase, vá pra **SQL Editor** e execute este script:

```sql
-- Tabela: colaboradores (usuários do sistema)
CREATE TABLE colaboradores (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cargo TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: processos (compartilhada)
CREATE TABLE processos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  departamento TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  link_drive TEXT NOT NULL,
  link_youtube TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  observacoes TEXT,
  criado_por UUID NOT NULL REFERENCES colaboradores(id),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: clientes (compartilhada)
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_empresa TEXT NOT NULL,
  cnpj TEXT,
  contato TEXT,
  responsavel TEXT,
  observacoes TEXT,
  criado_por UUID NOT NULL REFERENCES colaboradores(id),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: historico_clientes
CREATE TABLE historico_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  anotacao TEXT NOT NULL,
  criado_por UUID NOT NULL REFERENCES colaboradores(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: fluxos (compartilhada)
CREATE TABLE fluxos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  criado_por UUID NOT NULL REFERENCES colaboradores(id),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: passos_fluxo
CREATE TABLE passos_fluxo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fluxo_id UUID NOT NULL REFERENCES fluxos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('acao', 'decisao', 'inicio', 'fim')),
  texto TEXT,
  processo_id UUID REFERENCES processos(id),
  ordem INTEGER NOT NULL,
  proximo_sim_id UUID REFERENCES passos_fluxo(id),
  proximo_nao_id UUID REFERENCES passos_fluxo(id),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: tarefas_pessoais (pessoal)
CREATE TABLE tarefas_pessoais (
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
CREATE TABLE tarefas_equipe (
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
CREATE TABLE prazos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  data_vencimento DATE NOT NULL,
  responsavel_id UUID REFERENCES colaboradores(id),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'cumprido')),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: certidoes (pessoal)
CREATE TABLE certidoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id),
  tipo TEXT NOT NULL,
  data_emissao DATE NOT NULL,
  data_validade DATE NOT NULL,
  status TEXT DEFAULT 'válida',
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela: certificados (pessoal)
CREATE TABLE certificados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('e-CNPJ', 'e-CPF')),
  data_emissao DATE NOT NULL,
  data_validade DATE NOT NULL,
  responsavel_id UUID REFERENCES colaboradores(id),
  status TEXT DEFAULT 'válido',
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Criar índices pra performance
CREATE INDEX idx_processos_status ON processos(status);
CREATE INDEX idx_clientes_nome ON clientes(nome_empresa);
CREATE INDEX idx_tarefas_pessoais_usuario ON tarefas_pessoais(usuario_id);
CREATE INDEX idx_tarefas_equipe_atribuido ON tarefas_equipe(atribuido_para);
CREATE INDEX idx_prazos_usuario ON prazos(usuario_id);
CREATE INDEX idx_certidoes_usuario ON certidoes(usuario_id);
CREATE INDEX idx_certificados_usuario ON certificados(usuario_id);
```

- [ ] **Step 4: Verificar tabelas criadas**

No Supabase, vá pra **Table Editor** e confirme que todas as 13 tabelas aparecem listadas no menu esquerdo. Se alguma estiver faltando, o script falhou — verifique os erros.

---

## Task 1.2: Ativar autenticação Supabase (email/senha)

**Arquivos:**
- Nenhum arquivo novo (configuração no painel Supabase)

**Steps:**

- [ ] **Step 1: Ativar Auth email/password**

No Supabase, vá pra **Authentication > Providers**:
1. Procure por "Email" na lista
2. Clique para expandir
3. Toggle **Confirm email** para OFF (pra não precisar confirmar no início)
4. Clique **Save**

- [ ] **Step 2: Criar sua primeira conta (admin)**

Vá pra **Authentication > Users** e clique **+ Create new user**:
- Email: seu email (ex: amandaperruchegarcia@gmail.com)
- Password: uma senha segura
- Clique **Create user**

- [ ] **Step 3: Confirmar conta no banco**

Na tabela `colaboradores`, insira uma linha com seus dados:

```sql
INSERT INTO colaboradores (id, nome, email, cargo, role, ativo)
VALUES (
  '<seu user_id from auth.users>',
  'Amanda',
  'amandaperruchegarcia@gmail.com',
  'Proprietária',
  'admin',
  true
);
```

⚠️ **Como pegar seu `user_id`:** No **Authentication > Users**, abra sua conta criada; o ID apareça no topo.

---

## Task 1.3: Implementar Row-Level Security (RLS) policies

**Arquivos:**
- Referência: `DESIGN-FASE-FINAL.md` seção 4.3 e 5.3

**Steps:**

- [ ] **Step 1: Ativar RLS em todas as tabelas**

No Supabase, vá pra **Authentication > Policies** e ative RLS em cada tabela:

Para cada tabela (`processos`, `clientes`, `historico_clientes`, `fluxos`, `passos_fluxo`, `tarefas_pessoais`, `tarefas_equipe`, `prazos`, `certidoes`, `certificados`):

1. Clique na tabela
2. Clique **Enable RLS**
3. Clique **+ Create policy**

- [ ] **Step 2: Criar policy de leitura para tabelas compartilhadas**

Tabelas: `processos`, `clientes`, `historico_clientes`, `fluxos`, `passos_fluxo`

Policy: **SELECT** (leitura)

```sql
-- Qualquer usuário autenticado consegue ler
CREATE POLICY "read_all" ON <tabela>
  FOR SELECT
  TO authenticated
  USING (true);
```

- [ ] **Step 3: Criar policy de escrita para tabelas compartilhadas (admin only)**

Tabelas: `processos`, `clientes`, `historico_clientes`, `fluxos`, `passos_fluxo`

Policies: **INSERT**, **UPDATE**, **DELETE**

```sql
-- Só admin consegue escrever
CREATE POLICY "admin_insert" ON <tabela>
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM colaboradores
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_update" ON <tabela>
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM colaboradores
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM colaboradores
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_delete" ON <tabela>
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM colaboradores
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

- [ ] **Step 4: Criar policies para tabelas pessoais**

Tabelas: `tarefas_pessoais`, `tarefas_equipe`, `prazos`, `certidoes`, `certificados`

**Para `tarefas_pessoais` (só vê suas próprias):**

```sql
CREATE POLICY "select_own" ON tarefas_pessoais
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "insert_own" ON tarefas_pessoais
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "update_own" ON tarefas_pessoais
  FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "delete_own" ON tarefas_pessoais
  FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());
```

**Para `tarefas_equipe` (quem criou consegue editar; quem recebeu consegue ver):**

```sql
CREATE POLICY "select_mine" ON tarefas_equipe
  FOR SELECT
  TO authenticated
  USING (criado_por = auth.uid() OR atribuido_para = auth.uid());

CREATE POLICY "insert_own" ON tarefas_equipe
  FOR INSERT
  TO authenticated
  WITH CHECK (criado_por = auth.uid());

CREATE POLICY "update_own" ON tarefas_equipe
  FOR UPDATE
  TO authenticated
  USING (criado_por = auth.uid())
  WITH CHECK (criado_por = auth.uid());

CREATE POLICY "delete_own" ON tarefas_equipe
  FOR DELETE
  TO authenticated
  USING (criado_por = auth.uid());
```

**Para `prazos`, `certidoes`, `certificados` (igual a `tarefas_pessoais`):**

```sql
-- Repetir o padrão de tarefas_pessoais pra cada uma
```

- [ ] **Step 5: Testar RLS no Supabase**

1. Vá pra **SQL Editor**
2. Execute: `SELECT * FROM processos;` (sem dados ainda, mas não dá erro)
3. Se receber erro de permissão, RLS está ativo ✅

- [ ] **Step 6: Commit (não há código pra commitar, só config no Supabase)**

Anote os valores:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

(Vamos usar esses na próxima fase)

---

# FASE 2: Refatorar Código Frontend (localStorage → Supabase)

Este é o trabalho pesado. Cada arquivo JS segue o mesmo padrão de refatoração. Vou criar as funções base uma vez na Task 2.1, depois aplicar pra cada módulo.

## Task 2.1: Criar helpers de Supabase e setup inicial

**Arquivos:**
- Criar: `aula-2/app/supabase-config.js`
- Criar: `aula-2/.env.example`
- Modify: `aula-2/app/index.html` (adiciona imports)

**Interfaces:**
- Produz: 
  - `supabase` (cliente Supabase global)
  - `usuario_id` (ID do usuário logado)
- Próximas tasks consomem: `supabase.from(table).select/insert/update/delete`

**Steps:**

- [ ] **Step 1: Criar `.env.example`**

```bash
# .env.example
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

- [ ] **Step 2: Criar `supabase-config.js`**

```javascript
// aula-2/app/supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://your-project.supabase.co'; // Substituir com seu URL
const SUPABASE_KEY = 'eyJ...'; // Substituir com sua chave anon

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export let usuario_id = null;
export let usuario_nome = null;

export async function inicializarSessao() {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    usuario_id = data.session.user.id;
    usuario_nome = data.session.user.email;
    return true; // autenticado
  }
  return false; // não autenticado
}

export async function fazerLogout() {
  await supabase.auth.signOut();
  usuario_id = null;
  usuario_nome = null;
}
```

⚠️ **TODO-MANUAL:** Substituir `SUPABASE_URL` e `SUPABASE_KEY` com os valores reais que você guardou na Task 1.1.

- [ ] **Step 3: Adicionar imports no `index.html`**

No `<head>` do `index.html`, adicionar (antes dos outros scripts):

```html
<script type="module">
  import { supabase, inicializarSessao } from './supabase-config.js';
  window.supabase = supabase;
  window.inicializarSessao = inicializarSessao;
</script>
```

- [ ] **Step 4: Commit**

```bash
git add .env.example aula-2/app/supabase-config.js aula-2/app/index.html
git commit -m "setup: configure Supabase client"
```

---

## Task 2.2: Refatorar `processos.js`

**Arquivos:**
- Modify: `aula-2/app/processos.js` (todo o arquivo)

**Interfaces:**
- Consome: `supabase` (global), `usuario_id` (global)
- Produz:
  - `async carregarProcessos()` → `Promise<Array>`
  - `async salvarProcesso(proc)` → `Promise<void>`
  - `async atualizarProcesso(id, proc)` → `Promise<void>`
  - `async deletarProcesso(id)` → `Promise<void>`

**Steps:**

- [ ] **Step 1: Substituir função `carregarProcessos()`**

**Antes:**
```javascript
function carregarProcessos() {
  return JSON.parse(localStorage.getItem('processos') || '[]');
}
```

**Depois:**
```javascript
async function carregarProcessos() {
  const { data, error } = await supabase
    .from('processos')
    .select('*')
    .eq('status', 'ativo');
  
  if (error) {
    console.error('Erro ao carregar processos:', error);
    return [];
  }
  return data || [];
}
```

- [ ] **Step 2: Substituir função `salvarProcesso()`**

**Antes:**
```javascript
function salvarProcesso(processo) {
  const processos = carregarProcessos();
  processo.id = Math.random().toString(36).substr(2, 9);
  processos.push(processo);
  localStorage.setItem('processos', JSON.stringify(processos));
}
```

**Depois:**
```javascript
async function salvarProcesso(processo) {
  const { error } = await supabase
    .from('processos')
    .insert({
      nome: processo.nome,
      departamento: processo.departamento,
      codigo: processo.codigo,
      link_drive: processo.linkDrive,
      link_youtube: processo.linkYoutube,
      status: processo.status || 'ativo',
      observacoes: processo.observacoes,
      criado_por: usuario_id
    });
  
  if (error) {
    console.error('Erro ao salvar processo:', error);
    throw error;
  }
}
```

- [ ] **Step 3: Substituir função `atualizarProcesso()`**

**Antes:**
```javascript
function atualizarProcesso(id, processoAtualizado) {
  const processos = carregarProcessos();
  const idx = processos.findIndex(p => p.id === id);
  if (idx !== -1) {
    processos[idx] = { ...processos[idx], ...processoAtualizado };
    localStorage.setItem('processos', JSON.stringify(processos));
  }
}
```

**Depois:**
```javascript
async function atualizarProcesso(id, processoAtualizado) {
  const { error } = await supabase
    .from('processos')
    .update({
      nome: processoAtualizado.nome,
      departamento: processoAtualizado.departamento,
      codigo: processoAtualizado.codigo,
      link_drive: processoAtualizado.linkDrive,
      link_youtube: processoAtualizado.linkYoutube,
      status: processoAtualizado.status,
      observacoes: processoAtualizado.observacoes,
      atualizado_em: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao atualizar processo:', error);
    throw error;
  }
}
```

- [ ] **Step 4: Substituir função `deletarProcesso()`**

**Antes:**
```javascript
function deletarProcesso(id) {
  const processos = carregarProcessos();
  const filtrados = processos.filter(p => p.id !== id);
  localStorage.setItem('processos', JSON.stringify(filtrados));
}
```

**Depois:**
```javascript
async function deletarProcesso(id) {
  const { error } = await supabase
    .from('processos')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao deletar processo:', error);
    throw error;
  }
}
```

- [ ] **Step 5: Ajustar event listeners pra ser `async`**

No arquivo, procure por linhas como:
```javascript
procSalvarBtn.addEventListener('click', () => { ... });
```

Mude pra:
```javascript
procSalvarBtn.addEventListener('click', async () => { ... });
```

E adicione `await` antes de chamar as funções de Supabase:
```javascript
procSalvarBtn.addEventListener('click', async () => {
  await salvarProcesso(processo);
  await atualizarLista(); // chama carregarProcessos() novamente
});
```

- [ ] **Step 6: Testar localmente**

```bash
# Terminal, na pasta aula-2
python no_cache_server.py
# Abrir http://localhost:8000/preview.html
```

Procure por erros no console do navegador (F12 > Console). Se houver erro de autenticação, significa que as credenciais de Supabase estão erradas.

- [ ] **Step 7: Commit**

```bash
git add aula-2/app/processos.js
git commit -m "refactor: migrate processos.js from localStorage to Supabase"
```

---

## Task 2.3: Refatorar `minhas-tarefas.js`

**Arquivos:**
- Modify: `aula-2/app/minhas-tarefas.js`

**Interfaces:**
- Consome: `supabase`, `usuario_id`
- Produz:
  - `async carregarTarefas()` → `Promise<Array>`
  - `async salvarTarefa(tarefa)` → `Promise<void>`
  - `async atualizarTarefa(id, tarefa)` → `Promise<void>`
  - `async deletarTarefa(id)` → `Promise<void>`

**Steps:**

- [ ] **Aplicar mesmo padrão da Task 2.2**

Substitua:
- `localStorage.getItem('minhas_tarefas')` → `supabase.from('tarefas_pessoais').select('*').eq('usuario_id', usuario_id)`
- `localStorage.setItem(...)` → `supabase.from('tarefas_pessoais').insert({...})`
- Etc.

Referência de campos:
```javascript
{
  usuario_id: usuario_id,  // obrigatório, auto-preenchido
  titulo: tarefa.titulo,
  descricao: tarefa.descricao,
  prazo: tarefa.prazo,     // formato: 'YYYY-MM-DD'
  status: tarefa.status    // 'a-fazer' | 'fazendo' | 'feito'
}
```

- [ ] **Testar**

```bash
python no_cache_server.py
# Adicionar uma tarefa nova
# Esperar render
# Fazer refresh (F5)
# Tarefa deve aparecer (vindo do Supabase)
```

- [ ] **Commit**

```bash
git add aula-2/app/minhas-tarefas.js
git commit -m "refactor: migrate minhas-tarefas.js to Supabase"
```

---

## Task 2.4: Refatorar `tarefas-equipe.js`

**Arquivos:**
- Modify: `aula-2/app/tarefas-equipe.js`

**Interfaces:**
- Consome: `supabase`, `usuario_id`
- Produz:
  - `async carregarTarefas()` → `Promise<Array>`
  - `async salvarTarefa(tarefa)` → `Promise<void>`
  - `async atualizarTarefa(id, tarefa)` → `Promise<void>`
  - `async deletarTarefa(id)` → `Promise<void>`

**Steps:**

- [ ] **Aplicar padrão com tabela `tarefas_equipe`**

Diferença: `tarefas_equipe` tem dois campos de usuário:
```javascript
{
  criado_por: usuario_id,          // quem criou (você)
  atribuido_para: tarefa.responsavel, // quem recebeu (outro colaborador)
  titulo: tarefa.titulo,
  descricao: tarefa.descricao,
  prazo: tarefa.prazo,
  status: tarefa.status
}
```

RLS: usuário só vê tarefas onde `criado_por = auth.uid() OR atribuido_para = auth.uid()`

- [ ] **Adicionar filtro de responsável**

Na função de carregar, adicione filtro opcional:

```javascript
async function carregarTarefas(filtroResponsavel = null) {
  let query = supabase
    .from('tarefas_equipe')
    .select('*')
    .or(`criado_por.eq.${usuario_id},atribuido_para.eq.${usuario_id}`);
  
  if (filtroResponsavel) {
    query = query.eq('atribuido_para', filtroResponsavel);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
```

- [ ] **Testar**

- [ ] **Commit**

```bash
git add aula-2/app/tarefas-equipe.js
git commit -m "refactor: migrate tarefas-equipe.js to Supabase"
```

---

## Task 2.5: Refatorar `prazos.js`

**Arquivos:**
- Modify: `aula-2/app/prazos.js`

**Interfaces:**
- Consome: `supabase`, `usuario_id`
- Produz:
  - `async carregarPrazos()` → `Promise<Array>`
  - `async salvarPrazo(prazo)` → `Promise<void>`
  - `async atualizarPrazo(id, prazo)` → `Promise<void>`
  - `async deletarPrazo(id)` → `Promise<void>`

**Steps:**

- [ ] **Aplicar padrão com tabela `prazos`**

```javascript
{
  usuario_id: usuario_id,
  titulo: prazo.titulo,
  cliente_id: prazo.cliente_id,  // pode ser null
  data_vencimento: prazo.dataVencimento, // 'YYYY-MM-DD'
  responsavel_id: prazo.responsavel_id,
  status: prazo.status  // 'pendente' | 'cumprido'
}
```

- [ ] **Calcular status automaticamente**

Ao carregar, detecte prazos vencidos:

```javascript
async function carregarPrazos() {
  const { data, error } = await supabase
    .from('prazos')
    .select('*')
    .eq('usuario_id', usuario_id);
  
  if (error) throw error;
  
  // Marcar como vencido se data_vencimento < hoje
  const hoje = new Date().toISOString().split('T')[0];
  return (data || []).map(p => ({
    ...p,
    status: p.data_vencimento < hoje && p.status === 'pendente' ? 'vencido' : p.status
  }));
}
```

- [ ] **Destaque visual pra vencidos**

Na função que renderiza a lista, adicione classe CSS:

```javascript
const item = document.createElement('div');
if (prazo.data_vencimento < hoje && prazo.status !== 'cumprido') {
  item.classList.add('alerta-vencimento'); // cor dourada (já existe em style.css)
}
```

- [ ] **Testar**

- [ ] **Commit**

```bash
git add aula-2/app/prazos.js
git commit -m "refactor: migrate prazos.js to Supabase"
```

---

## Task 2.6: Refatorar `certidoes.js`

**Arquivos:**
- Modify: `aula-2/app/certidoes.js`

**Interfaces:**
- Consome: `supabase`, `usuario_id`
- Produz: funções CRUD como antes

**Steps:**

- [ ] **Aplicar padrão com tabela `certidoes`**

```javascript
{
  usuario_id: usuario_id,
  cliente_id: certidao.cliente_id,
  tipo: certidao.tipo,  // 'Conjunta', 'Federal', etc.
  data_emissao: certidao.dataEmissao,
  data_validade: certidao.dataValidade,
  status: 'válida' // calculado automaticamente ao carregar
}
```

- [ ] **Calcular status automaticamente**

```javascript
const hoje = new Date().toISOString().split('T')[0];
data.map(c => ({
  ...c,
  status: c.data_validade < hoje ? 'vencida' : 'válida'
}))
```

- [ ] **Destaque pra vencidas (cor dourada)**

- [ ] **Testar**

- [ ] **Commit**

---

## Task 2.7: Refatorar `certificados.js`

**Arquivos:**
- Modify: `aula-2/app/certificados.js`

**Padrão idêntico a `certidoes.js`, com campos:**

```javascript
{
  usuario_id: usuario_id,
  cliente_id: certificado.cliente_id,
  tipo: certificado.tipo,  // 'e-CNPJ' | 'e-CPF'
  data_emissao: certificado.dataEmissao,
  data_validade: certificado.dataValidade,
  responsavel_id: certificado.responsavel_id,
  status: 'válido' // calculado
}
```

- [ ] **Testar + Commit**

---

## Task 2.8: Refatorar `clientes.js`

**Arquivos:**
- Modify: `aula-2/app/clientes.js`

**Interfaces:**
- Consome: `supabase`, `usuario_id`
- Produz:
  - `async carregarClientes()` → lista de clientes
  - `async salvarCliente(cliente)` → insere
  - `async adicionarAnotacao(cliente_id, anotacao)` → insere em `historico_clientes`
  - `async carregarHistorico(cliente_id)` → lista de anotações

**Steps:**

- [ ] **Refatorar CRUD de clientes**

```javascript
// Carregar
async function carregarClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nome_empresa');
  if (error) throw error;
  return data || [];
}

// Salvar
async function salvarCliente(cliente) {
  const { error } = await supabase
    .from('clientes')
    .insert({
      nome_empresa: cliente.nomeEmpresa,
      cnpj: cliente.cnpj,
      contato: cliente.contato,
      responsavel: cliente.responsavel,
      observacoes: cliente.observacoes,
      criado_por: usuario_id
    });
  if (error) throw error;
}

// Atualizar
async function atualizarCliente(id, cliente) {
  const { error } = await supabase
    .from('clientes')
    .update({
      nome_empresa: cliente.nomeEmpresa,
      cnpj: cliente.cnpj,
      contato: cliente.contato,
      responsavel: cliente.responsavel,
      observacoes: cliente.observacoes,
      atualizado_em: new Date().toISOString()
    })
    .eq('id', id);
  if (error) throw error;
}

// Deletar
async function deletarCliente(id) {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
```

- [ ] **Refatorar histórico de anotações**

```javascript
async function carregarHistorico(cliente_id) {
  const { data, error } = await supabase
    .from('historico_clientes')
    .select('*')
    .eq('cliente_id', cliente_id)
    .order('data', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function adicionarAnotacao(cliente_id, anotacao) {
  const { error } = await supabase
    .from('historico_clientes')
    .insert({
      cliente_id: cliente_id,
      data: new Date().toISOString().split('T')[0],
      anotacao: anotacao,
      criado_por: usuario_id
    });
  if (error) throw error;
}
```

- [ ] **Testar + Commit**

---

## Task 2.9: Refatorar `fluxos.js`

**Arquivos:**
- Modify: `aula-2/app/fluxos.js`

**Interfaces:**
- Consome: `supabase`, `usuario_id`
- Produz:
  - `async carregarFluxos()` → lista de fluxos
  - `async salvarFluxo(fluxo)` → cria fluxo + passos
  - `async atualizarFluxo(id, fluxo)` → atualiza
  - `async adicionarPasso(fluxo_id, passo)` → insere em `passos_fluxo`
  - `async atualizarPasso(passo_id, passo)` → atualiza
  - `async deletarPasso(passo_id)` → deleta

**Steps:**

- [ ] **Refatorar CRUD de fluxos**

```javascript
async function carregarFluxos() {
  const { data, error } = await supabase
    .from('fluxos')
    .select('*')
    .order('nome');
  if (error) throw error;
  return data || [];
}

async function salvarFluxo(fluxo) {
  const { data, error } = await supabase
    .from('fluxos')
    .insert({
      nome: fluxo.nome,
      criado_por: usuario_id
    })
    .select();
  
  if (error) throw error;
  return data[0]; // retorna o fluxo criado com ID
}

async function deletarFluxo(id) {
  // Deletar em cascata (passos deletam automaticamente)
  const { error } = await supabase
    .from('fluxos')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
```

- [ ] **Refatorar CRUD de passos**

```javascript
async function carregarPassos(fluxo_id) {
  const { data, error } = await supabase
    .from('passos_fluxo')
    .select('*')
    .eq('fluxo_id', fluxo_id)
    .order('ordem');
  if (error) throw error;
  return data || [];
}

async function adicionarPasso(fluxo_id, passo) {
  const { error } = await supabase
    .from('passos_fluxo')
    .insert({
      fluxo_id: fluxo_id,
      tipo: passo.tipo,  // 'acao', 'decisao', 'inicio', 'fim'
      texto: passo.texto,
      processo_id: passo.processo_id || null,
      ordem: passo.ordem,
      proximo_sim_id: passo.proximoSimId || null,
      proximo_nao_id: passo.proximoNaoId || null
    });
  if (error) throw error;
}

async function deletarPasso(passo_id) {
  // Deletar em cascata se necessário
  const { error } = await supabase
    .from('passos_fluxo')
    .delete()
    .eq('id', passo_id);
  if (error) throw error;
}
```

- [ ] **Testar + Commit**

---

## Task 2.10: Refatorar `dashboard.js`

**Arquivos:**
- Modify: `aula-2/app/dashboard.js`

**Interfaces:**
- Consome: `supabase`, `usuario_id`
- Produz:
  - `async carregarResumoDashboard()` → objeto com contagens

**Steps:**

- [ ] **Refatorar para contar dados do Supabase**

Dashboard não guarda dados, só lê. Exemplo:

```javascript
async function carregarResumoDashboard() {
  try {
    const [processos, fluxos, minhasTarefas, tarefasEquipe, prazos, certidoes, certificados, clientes] = await Promise.all([
      supabase.from('processos').select('*', { count: 'exact', head: true }),
      supabase.from('fluxos').select('*', { count: 'exact', head: true }),
      supabase.from('tarefas_pessoais').select('*').eq('usuario_id', usuario_id),
      supabase.from('tarefas_equipe').select('*').or(`criado_por.eq.${usuario_id},atribuido_para.eq.${usuario_id}`),
      supabase.from('prazos').select('*').eq('usuario_id', usuario_id),
      supabase.from('certidoes').select('*').eq('usuario_id', usuario_id),
      supabase.from('certificados').select('*').eq('usuario_id', usuario_id),
      supabase.from('clientes').select('*', { count: 'exact', head: true })
    ]);

    const hoje = new Date().toISOString().split('T')[0];

    return {
      processosAtivos: processos.count || 0,
      fluxosCadastrados: fluxos.count || 0,
      minhasTarefasPendentes: (minhasTarefas.data || []).filter(t => t.status !== 'feito').length,
      tarefasEquipePendentes: (tarefasEquipe.data || []).filter(t => t.status !== 'feito').length,
      prazosVencidos: (prazos.data || []).filter(p => p.data_vencimento < hoje && p.status === 'pendente').length,
      certidulesVencidas: (certidoes.data || []).filter(c => c.data_validade < hoje).length,
      certificadosVencidos: (certificados.data || []).filter(c => c.data_validade < hoje).length,
      clientesCadastrados: clientes.count || 0
    };
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    return {}; // retorna vazio se erro
  }
}
```

- [ ] **Refatorar calendário**

O calendário precisa dos dias que têm prazos, tarefas, etc:

```javascript
async function carregarEventosDoMes(ano, mes) {
  // Buscar prazos, tarefas, certidões do mês
  const inicioDoPeriodo = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const fimDoPeriodo = new Date(ano, mes, 0).toISOString().split('T')[0];

  const [prazos, tarefas, certidoes, certificados] = await Promise.all([
    supabase.from('prazos').select('data_vencimento').eq('usuario_id', usuario_id).gte('data_vencimento', inicioDoPeriodo).lte('data_vencimento', fimDoPeriodo),
    supabase.from('tarefas_pessoais').select('prazo').eq('usuario_id', usuario_id).gte('prazo', inicioDoPeriodo).lte('prazo', fimDoPeriodo),
    supabase.from('certidoes').select('data_validade').eq('usuario_id', usuario_id).gte('data_validade', inicioDoPeriodo).lte('data_validade', fimDoPeriodo),
    supabase.from('certificados').select('data_validade').eq('usuario_id', usuario_id).gte('data_validade', inicioDoPeriodo).lte('data_validade', fimDoPeriodo)
  ]);

  // Agrupar por dia
  const diasComEventos = {};
  [...(prazos.data || []), ...(tarefas.data || []), ...(certidoes.data || []), ...(certificados.data || [])].forEach(item => {
    const data = item.data_vencimento || item.prazo || item.data_validade;
    if (!diasComEventos[data]) diasComEventos[data] = [];
    diasComEventos[data].push(item);
  });

  return diasComEventos;
}
```

- [ ] **Testar + Commit**

---

# FASE 3: Autenticação, Login e Migração de Dados

## Task 3.1: Criar tela de Login

**Arquivos:**
- Criar: `aula-2/app/login.js`
- Modify: `aula-2/app/index.html` (adicionar seção login)

**Interfaces:**
- Consome: `supabase`
- Produz:
  - `async fazerLogin(email, senha)` → autenticação
  - `async verificarAutenticacao()` → checa se já logado
  - `async fazerLogout()` → limpa sessão

**Steps:**

- [ ] **Step 1: Adicionar seção de login ao HTML**

No `index.html`, adicione (no início de `<main>`, antes de outras seções):

```html
<section id="tela-login" class="tela ativa">
  <div class="login-container">
    <div class="login-box">
      <div class="logo" style="text-align: center; margin-bottom: 2rem;">
        <img src="logo-simbolo-verde.png" alt="Alprox" style="width: 60px; height: 60px;">
        <p style="margin: 1rem 0 0; font-size: 1.2rem; color: var(--cor-principal);">
          Alprox <strong>Processos</strong>
        </p>
      </div>
      
      <form id="login-form">
        <div class="campo">
          <label for="login-email">Email</label>
          <input type="email" id="login-email" required placeholder="seu@email.com">
        </div>
        <div class="campo">
          <label for="login-senha">Senha</label>
          <input type="password" id="login-senha" required placeholder="••••••••">
        </div>
        <button type="submit" class="btn-primario" style="width: 100%; margin-top: 1rem;">
          Entrar
        </button>
        <p id="login-erro" class="erro" style="margin-top: 1rem; display: none;"></p>
      </form>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Adicionar CSS para tela de login**

No `style.css`, adicione:

```css
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 360px;
}

.erro {
  color: var(--cor-destaque, #d4a574);
  font-size: 0.9rem;
  text-align: center;
}
```

- [ ] **Step 3: Criar `login.js`**

```javascript
// aula-2/app/login.js
import { supabase, inicializarSessao, fazerLogout as supabaseLogout } from './supabase-config.js';

const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginSenha = document.getElementById('login-senha');
const loginErro = document.getElementById('login-erro');
const telaLogin = document.getElementById('tela-login');

export async function fazerLogin(email, senha) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha
    });

    if (error) throw error;

    // Buscar dados do usuário em colaboradores
    const { data: colaborador } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!colaborador) {
      // Primeira vez — criar entrada em colaboradores
      await supabase.from('colaboradores').insert({
        id: data.user.id,
        nome: email.split('@')[0],
        email: email,
        role: 'user',
        ativo: true
      });
    }

    // Atualizar session global
    const logado = await inicializarSessao();
    if (logado) {
      telaLogin.classList.remove('ativa');
      document.getElementById('tela-dashboard').classList.add('ativa');
      // Disparar evento pra carregar dados
      window.dispatchEvent(new Event('usuario-logado'));
    }
  } catch (error) {
    console.error('Erro de login:', error);
    loginErro.textContent = error.message || 'Erro ao fazer login. Verifique credenciais.';
    loginErro.style.display = 'block';
  }
}

export async function fazerLogout() {
  await supabaseLogout();
  telaLogin.classList.add('ativa');
  document.getElementById('tela-dashboard').classList.remove('ativa');
  loginForm.reset();
  loginErro.style.display = 'none';
}

export async function verificarAutenticacao() {
  const autenticado = await inicializarSessao();
  if (!autenticado) {
    telaLogin.classList.add('ativa');
  } else {
    telaLogin.classList.remove('ativa');
  }
  return autenticado;
}

// Event listener pro form
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginErro.style.display = 'none';
  const email = loginEmail.value;
  const senha = loginSenha.value;
  await fazerLogin(email, senha);
});
```

- [ ] **Step 4: Adicionar evento de logout no header**

No arquivo `app.js`, procure pelo header e adicione um botão "Sair":

```javascript
const logoutBtn = document.createElement('button');
logoutBtn.textContent = 'Sair';
logoutBtn.className = 'btn-secundario';
logoutBtn.addEventListener('click', () => {
  fazerLogout();
});
header.appendChild(logoutBtn);
```

- [ ] **Step 5: Chamar verificação no app.js**

No início de `app.js`, adicione:

```javascript
import { verificarAutenticacao, fazerLogout } from './login.js';

window.addEventListener('DOMContentLoaded', async () => {
  const autenticado = await verificarAutenticacao();
  if (autenticado) {
    // Carregar dados ao fazer login
    window.addEventListener('usuario-logado', () => {
      // Recarregar todas as telas
      carregarDashboard();
      carregarProcessos();
      // etc...
    });
  }
});
```

- [ ] **Testar**

```bash
python no_cache_server.py
# Abrir http://localhost:8000/preview.html
# Você deve ver a tela de login
# Digitar suas credenciais (as que criou no Supabase na Task 1.2)
# Fazer login
# Dashboard deve carregar
```

- [ ] **Commit**

```bash
git add aula-2/app/login.js aula-2/app/index.html aula-2/app/style.css
git commit -m "feat: add login screen and authentication"
```

---

## Task 3.2: Implementar migração automática (localStorage → Supabase)

**Arquivos:**
- Criar: `aula-2/app/migration.js`
- Modify: `aula-2/app/index.html` (adicionar import)

**Interfaces:**
- Consome: `supabase`, `usuario_id`
- Produz: dados migrados no Supabase

**Steps:**

- [ ] **Step 1: Criar `migration.js`**

```javascript
// aula-2/app/migration.js
import { supabase } from './supabase-config.js';

export async function migrarDadosLocalStorage(usuario_id) {
  // Verificar se já migrou (flag em localStorage)
  if (localStorage.getItem('_migrado_supabase')) {
    return; // já migrou, pula
  }

  try {
    // 1. Migrar processos (compartilhado)
    const processos = JSON.parse(localStorage.getItem('processos') || '[]');
    if (processos.length > 0) {
      const processosFormatados = processos.map(p => ({
        nome: p.nome,
        departamento: p.departamento,
        codigo: p.codigo || `AUTO-${Date.now()}`,
        link_drive: p.linkDrive || '',
        link_youtube: p.linkYoutube || null,
        status: p.status || 'ativo',
        observacoes: p.observacoes || '',
        criado_por: usuario_id
      }));
      
      const { error } = await supabase.from('processos').insert(processosFormatados);
      if (error) console.error('Erro ao migrar processos:', error);
    }

    // 2. Migrar clientes (compartilhado)
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    if (clientes.length > 0) {
      const clientesFormatados = clientes.map(c => ({
        nome_empresa: c.nomeEmpresa || '',
        cnpj: c.cnpj || '',
        contato: c.contato || '',
        responsavel: c.responsavel || '',
        observacoes: c.observacoes || '',
        criado_por: usuario_id
      }));
      
      const { error } = await supabase.from('clientes').insert(clientesFormatados);
      if (error) console.error('Erro ao migrar clientes:', error);
    }

    // 3. Migrar fluxos (compartilhado)
    const fluxos = JSON.parse(localStorage.getItem('fluxos') || '[]');
    if (fluxos.length > 0) {
      for (const fluxo of fluxos) {
        const { data: fluxoInserido, error: erroFluxo } = await supabase
          .from('fluxos')
          .insert({
            nome: fluxo.nome,
            criado_por: usuario_id
          })
          .select();

        if (erroFluxo) {
          console.error('Erro ao migrar fluxo:', erroFluxo);
          continue;
        }

        // Migrar passos do fluxo
        if (fluxo.passos && fluxo.passos.length > 0) {
          const passosFormatados = fluxo.passos.map((passo, idx) => ({
            fluxo_id: fluxoInserido[0].id,
            tipo: passo.tipo,
            texto: passo.texto || '',
            processo_id: passo.processoId || null,
            ordem: idx,
            proximo_sim_id: null,  // complexo demais pra mapear IDs antigos
            proximo_nao_id: null
          }));

          const { error: erroPassos } = await supabase
            .from('passos_fluxo')
            .insert(passosFormatados);
          
          if (erroPassos) console.error('Erro ao migrar passos:', erroPassos);
        }
      }
    }

    // 4. Migrar minhas tarefas (pessoal)
    const minhasTarefas = JSON.parse(localStorage.getItem('minhas_tarefas') || '[]');
    if (minhasTarefas.length > 0) {
      const tarefasFormatadas = minhasTarefas.map(t => ({
        usuario_id: usuario_id,
        titulo: t.titulo,
        descricao: t.descricao || '',
        prazo: t.prazo || null,
        status: t.status || 'a-fazer'
      }));

      const { error } = await supabase.from('tarefas_pessoais').insert(tarefasFormatadas);
      if (error) console.error('Erro ao migrar minhas tarefas:', error);
    }

    // 5. Migrar tarefas da equipe (pessoal)
    const tarefasEquipe = JSON.parse(localStorage.getItem('tarefas_equipe') || '[]');
    if (tarefasEquipe.length > 0) {
      const tarefasFormatadas = tarefasEquipe.map(t => ({
        criado_por: usuario_id,
        atribuido_para: usuario_id,  // TODO: mapear pra user real depois
        titulo: t.titulo,
        descricao: t.descricao || '',
        prazo: t.prazo || null,
        status: t.status || 'a-fazer'
      }));

      const { error } = await supabase.from('tarefas_equipe').insert(tarefasFormatadas);
      if (error) console.error('Erro ao migrar tarefas da equipe:', error);
    }

    // 6. Migrar prazos (pessoal)
    const prazos = JSON.parse(localStorage.getItem('prazos') || '[]');
    if (prazos.length > 0) {
      const prazosFormatados = prazos.map(p => ({
        usuario_id: usuario_id,
        titulo: p.titulo,
        cliente_id: null,  // TODO: mapear pra cliente real depois
        data_vencimento: p.dataVencimento,
        responsavel_id: null,
        status: p.status || 'pendente'
      }));

      const { error } = await supabase.from('prazos').insert(prazosFormatados);
      if (error) console.error('Erro ao migrar prazos:', error);
    }

    // 7. Migrar certidões (pessoal)
    const certidoes = JSON.parse(localStorage.getItem('certidoes') || '[]');
    if (certidoes.length > 0) {
      const certidulesFormatadas = certidoes.map(c => ({
        usuario_id: usuario_id,
        cliente_id: null,
        tipo: c.tipo,
        data_emissao: c.dataEmissao,
        data_validade: c.dataValidade,
        status: c.data_validade < new Date().toISOString().split('T')[0] ? 'vencida' : 'válida'
      }));

      const { error } = await supabase.from('certidoes').insert(certidulesFormatadas);
      if (error) console.error('Erro ao migrar certidões:', error);
    }

    // 8. Migrar certificados (pessoal)
    const certificados = JSON.parse(localStorage.getItem('certificados') || '[]');
    if (certificados.length > 0) {
      const certificadosFormatados = certificados.map(c => ({
        usuario_id: usuario_id,
        cliente_id: null,
        tipo: c.tipo,
        data_emissao: c.dataEmissao,
        data_validade: c.dataValidade,
        responsavel_id: null,
        status: c.data_validade < new Date().toISOString().split('T')[0] ? 'vencido' : 'válido'
      }));

      const { error } = await supabase.from('certificados').insert(certificadosFormatados);
      if (error) console.error('Erro ao migrar certificados:', error);
    }

    // Marcar como migrado
    localStorage.setItem('_migrado_supabase', 'true');
    console.log('✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
  }
}
```

- [ ] **Step 2: Chamar no app.js**

No `app.js`, após login bem-sucedido:

```javascript
import { migrarDadosLocalStorage } from './migration.js';

window.addEventListener('usuario-logado', async () => {
  // Executar migração na primeira vez
  await migrarDadosLocalStorage(usuario_id);
  
  // Depois carregar dados do Supabase
  carregarDashboard();
  carregarProcessos();
  // etc...
});
```

- [ ] **Step 3: Testar**

```bash
# Limpar dados locais pra simular primeira vez
# localStorage.clear() no console

# Fazer login novamente
# Verificar no Supabase > Table Editor que dados apareceram
```

- [ ] **Commit**

```bash
git add aula-2/app/migration.js aula-2/app/app.js
git commit -m "feat: implement automatic localStorage to Supabase migration"
```

---

# FASE 4: Vercel Deploy

## Task 4.1: Preparar repositório GitHub

**Arquivos:**
- Criar: `vercel.json`
- Criar: `package.json`
- Criar: `.gitignore`
- Modify: `supabase-config.js` (usar variáveis de ambiente)

**Steps:**

- [ ] **Step 1: Criar `vercel.json`**

```json
{
  "buildCommand": "",
  "outputDirectory": "app",
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

- [ ] **Step 2: Criar `package.json`**

```json
{
  "name": "alprox-processos",
  "version": "1.0.0",
  "description": "App de gerenciamento de processos ALPROX",
  "private": true,
  "scripts": {
    "dev": "python aula-2/no_cache_server.py",
    "preview": "open aula-2/preview.html"
  }
}
```

- [ ] **Step 3: Criar `.gitignore`**

```
.env
.env.local
.env.*.local
node_modules/
__pycache__/
*.pyc
.DS_Store
/dist
*.log
```

- [ ] **Step 4: Criar `.env.example`**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

- [ ] **Step 5: Refatorar `supabase-config.js` pra usar variáveis de ambiente**

```javascript
// aula-2/app/supabase-config.js
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJ...';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
```

⚠️ **Problema:** Arquivos HTML/JS não fazem build, então `import.meta.env` não funciona. Solução: colocar valores diretos no arquivo (commitir de verdade) OU usar substituição via Vercel.

**Abordagem recomendada:** Commitir os valores reais no `supabase-config.js` (são públicos de qualquer forma — é a chave `anon` que é segura)

```javascript
// aula-2/app/supabase-config.js
// Valores reais do seu projeto (públicos)
const SUPABASE_URL = 'https://xxx.supabase.co';
const SUPABASE_KEY = 'eyJ...';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
```

- [ ] **Step 6: Commit de infra**

```bash
git add vercel.json package.json .gitignore .env.example aula-2/app/supabase-config.js
git commit -m "chore: prepare for Vercel deployment"
```

---

## Task 4.2: Criar repositório GitHub e fazer push

**Steps:**

- [ ] **Step 1: Inicializar git (se ainda não tiver)**

```bash
cd c:\Users\Amanda\Desktop\workshop-criacao-app
git init
```

- [ ] **Step 2: Criar repositório no GitHub**

1. Ir pra https://github.com/new
2. Nome: `alprox-processos`
3. Público ou privado (sua escolha)
4. Criar repositório

- [ ] **Step 3: Conectar repositório local com GitHub**

```bash
git remote add origin https://github.com/<seu-usuario>/alprox-processos.git
git branch -M main
git push -u origin main
```

- [ ] **Step 4: Verificar no GitHub**

Abrir https://github.com/seu-usuario/alprox-processos — todos os arquivos devem estar lá (exceto `.env`, que tá no `.gitignore`)

---

## Task 4.3: Deploy na Vercel

**Steps:**

- [ ] **Step 1: Conectar Vercel com GitHub**

1. Ir pra https://vercel.com/import
2. Conectar GitHub account
3. Buscar repositório `alprox-processos`
4. Clique **Import**

- [ ] **Step 2: Configurar variáveis de ambiente**

No painel Vercel (durante import), procure por **Environment Variables** e adicione:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

⚠️ **Na prática:** Como não há build step, essas variáveis não serão usadas (já estão hardcoded em `supabase-config.js`). Mas deixe configuradas pra documentação.

- [ ] **Step 3: Deploy**

Clique **Deploy** — Vercel fará o deploy em ~2 min. URL será algo como: `alprox-processos.vercel.app`

- [ ] **Step 4: Testar**

Abrir `https://alprox-processos.vercel.app`:
1. Você deve ver a tela de login
2. Fazer login com suas credenciais do Supabase
3. Dashboard deve carregar
4. Tudo deve funcionar igual a local

- [ ] **Step 5: Configurar domínio customizado (opcional)**

No painel Vercel > **Settings > Domains**, você consegue adicionar um domínio seu (ex: `processos.alprox.com.br`)

---

# FASE 5: PWA (Progressive Web App)

## Task 5.1: Criar manifest.json

**Arquivos:**
- Criar: `aula-2/app/manifest.json`

**Steps:**

- [ ] **Step 1: Criar arquivo**

```json
{
  "name": "Alprox Processos",
  "short_name": "Alprox",
  "description": "App de gerenciamento de processos e instruções do escritório ALPROX",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2d7a4a",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    {
      "src": "logo-simbolo-verde.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "logo-simbolo-verde.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "categories": ["productivity"]
}
```

- [ ] **Step 2: Adicionar meta tags ao HTML**

No `<head>` de `index.html`:

```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#2d7a4a">
<meta name="description" content="App de gerenciamento de processos ALPROX">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Alprox">
<link rel="apple-touch-icon" href="logo-simbolo-verde.png">
<link rel="icon" type="image/png" href="logo-simbolo-verde.png">
```

- [ ] **Step 3: Commit**

```bash
git add aula-2/app/manifest.json aula-2/app/index.html
git commit -m "feat: add PWA manifest and meta tags"
```

- [ ] **Step 4: Fazer push pra Vercel**

```bash
git push origin main
```

Vercel fará deploy automático em alguns minutos.

---

## Task 5.2: Testar instalação no celular

**Steps:**

- [ ] **Step 1: Abrir no Safari (iPhone) ou Chrome (Android)**

URL: `https://alprox-processos.vercel.app`

- [ ] **Step 2: iOS (Safari)**

1. Tap no botão de compartilhar (↑)
2. Scroll e procure **"Add to Home Screen"**
3. Tap nele
4. Nomeie como "Alprox"
5. Tap **Add**

App fica instalado na tela inicial como ícone.

- [ ] **Step 3: Android (Chrome)**

1. Tap no menu (⋮)
2. Procure **"Install app"** ou **"Create shortcut"**
3. Tap
4. Confirme

App fica instalado com ícone na tela inicial.

- [ ] **Step 4: Testar**

- Abrir app do ícone (não via navegador)
- Fazer login
- Navegar entre telas
- Tudo deve funcionar igual

---

## Task 5.3: Testar offline (opcional)

**Steps:**

- [ ] **Pular por enquanto — PWA offline não foi pedido**

(Foi escolhida a opção A: "Instalável no celular, mas precisa internet")

Se depois quiser offline, adicionar Service Worker é simples (próxima fase).

---

# Checklist Final

- [ ] Supabase tabelas + RLS funcionando
- [ ] Frontend refatorado (10 módulos localStorage → Supabase)
- [ ] Tela de login + autenticação
- [ ] Migração automática funcionando
- [ ] App publicado em Vercel (URL acessível)
- [ ] PWA instalável no celular
- [ ] Todos os colaboradores conseguem fazer login
- [ ] Dados compartilhados visivelmente compartilhados
- [ ] Dados pessoais isolados por usuário

---

**Fim do Implementation Plan**
