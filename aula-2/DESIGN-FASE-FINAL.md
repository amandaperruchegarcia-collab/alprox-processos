# Design: Alprox Processos — Fase Final (Publicar)

**Data:** 2026-08-03  
**Versão:** 1.0  
**Status:** Aprovado para implementação

---

## 1. Visão Geral

Transformar o app Alprox Processos de um aplicativo local (localStorage) em um sistema publicado e multiusuário com autenticação individual, banco de dados na nuvem e instalação como PWA no celular.

**Stakeholder:** Amanda (proprietária ALPROX)  
**Usuários:** Amanda + colaboradores do escritório (estimado 3-5 pessoas inicialmente)  
**Timeline:** ~3 horas de desenvolvimento

---

## 2. Decisões Arquiteturais

| Decisão | Escolha | Motivo |
|---|---|---|
| **Framework** | HTML/CSS/JS puro + Vercel estático | Mais rápido; sem refatoração pra React/Next.js |
| **Backend** | Supabase (Auth + Database) | Managed service; sem servidor pra manter |
| **Compartilhamento de dados** | Híbrido: compartilhado (Processos, Clientes, Fluxos) + pessoal (Tarefas, Prazos, etc) | Reflete uso do escritório |
| **PWA** | Instalável + internet obrigatória | Simples; colaboradores têm internet no escritório |
| **Migração de dados** | Automática (localStorage → Supabase) | Sem perda de dados; transição suave |
| **Hosting** | Vercel (frontend estático) | Grátis; deploy automático via GitHub |

---

## 3. Arquitetura Técnica

### 3.1 Infraestrutura

```
┌─────────────────────────────────────────┐
│       Navegador (Celular/Desktop)       │
│  HTML/CSS/JS + Supabase-JS Client Lib   │
└──────────────┬──────────────────────────┘
               │ fetch via HTTPS
               ↓
┌──────────────────────────────────────┐
│   Supabase (Backend-as-a-Service)    │
├──────────────────────────────────────┤
│ • Auth: Login com email/senha         │
│ • Database: PostgreSQL                │
│ • RLS: Row-Level Security (permissões)│
└──────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│   Vercel Static Hosting               │
│   (HTML/CSS/JS só pra frontend)      │
└──────────────────────────────────────┘
```

### 3.2 Fluxo de Dados

1. **Usuário abre o app** → Vercel serve HTML/CSS/JS
2. **JavaScript carrega** → tenta conectar ao Supabase
3. **Check de autenticação** → se não tem token, mostra tela de Login
4. **Login bem-sucedido** → Supabase retorna JWT token
5. **Token guardado** → localStorage + sessionStorage
6. **Todas as requisições** → incluem o token no header
7. **Supabase valida** → RLS garante que usuário vê só seus dados + dados compartilhados

---

## 4. Banco de Dados (Supabase)

### 4.1 Tabelas Compartilhadas (todos leem, só admin edita)

#### `processos`
```sql
id (UUID, PK)
nome (text)
departamento (text)
codigo (text, unique)
link_drive (text)
link_youtube (text, nullable)
status (text: 'ativo'/'inativo')
observacoes (text, nullable)
criado_por (UUID, FK → colaboradores)
criado_em (timestamp)
atualizado_em (timestamp)
```

RLS Policy: `SELECT * pra todos; INSERT/UPDATE/DELETE só se criado_por = auth.uid() AND user.role = 'admin'`

#### `clientes`
```sql
id (UUID, PK)
nome_empresa (text)
cnpj (text)
contato (text)
responsavel (text, nullable)
observacoes (text, nullable)
criado_por (UUID, FK → colaboradores)
criado_em (timestamp)
atualizado_em (timestamp)
```

RLS Policy: `SELECT * pra todos; INSERT/UPDATE/DELETE só admin`

#### `historico_clientes`
```sql
id (UUID, PK)
cliente_id (UUID, FK → clientes)
data (date)
anotacao (text)
criado_por (UUID, FK → colaboradores)
criado_em (timestamp)
```

RLS Policy: `SELECT * pra todos; INSERT/UPDATE/DELETE só admin`

#### `fluxos`
```sql
id (UUID, PK)
nome (text)
criado_por (UUID, FK → colaboradores)
criado_em (timestamp)
atualizado_em (timestamp)
```

RLS Policy: `SELECT * pra todos; INSERT/UPDATE/DELETE só admin`

#### `passos_fluxo`
```sql
id (UUID, PK)
fluxo_id (UUID, FK → fluxos)
tipo (text: 'acao'/'decisao'/'inicio'/'fim')
texto (text)
processo_id (UUID, FK → processos, nullable)
ordem (integer)
proximo_sim_id (UUID, FK → passos_fluxo, nullable)
proximo_nao_id (UUID, FK → passos_fluxo, nullable)
criado_em (timestamp)
atualizado_em (timestamp)
```

RLS Policy: `SELECT * pra todos; INSERT/UPDATE/DELETE só admin`

### 4.2 Tabelas Pessoais (cada usuário vê só suas)

#### `tarefas_pessoais`
```sql
id (UUID, PK)
usuario_id (UUID, FK → auth.users)
titulo (text)
descricao (text, nullable)
prazo (date, nullable)
status (text: 'a-fazer'/'fazendo'/'feito')
criado_em (timestamp)
atualizado_em (timestamp)
```

RLS Policy: `SELECT/INSERT/UPDATE/DELETE só se usuario_id = auth.uid()`

#### `tarefas_equipe`
```sql
id (UUID, PK)
criado_por (UUID, FK → auth.users)
atribuido_para (UUID, FK → auth.users)
titulo (text)
descricao (text, nullable)
prazo (date, nullable)
status (text: 'a-fazer'/'fazendo'/'feito')
criado_em (timestamp)
atualizado_em (timestamp)
```

RLS Policy: `SELECT se criado_por OR atribuido_para = auth.uid(); INSERT/UPDATE/DELETE só criado_por`

#### `prazos`
```sql
id (UUID, PK)
usuario_id (UUID, FK → auth.users)
titulo (text)
cliente_id (UUID, FK → clientes)
data_vencimento (date)
responsavel_id (UUID, FK → auth.users)
status (text: 'pendente'/'cumprido')
criado_em (timestamp)
atualizado_em (timestamp)
```

RLS Policy: `SELECT/INSERT/UPDATE/DELETE só se usuario_id = auth.uid()`

#### `certidoes`
```sql
id (UUID, PK)
usuario_id (UUID, FK → auth.users)
cliente_id (UUID, FK → clientes)
tipo (text: ex 'Conjunta', 'Federal', 'Estadual')
data_emissao (date)
data_validade (date)
status (text: 'válida'/'vencida', calculado)
criado_em (timestamp)
atualizado_em (timestamp)
```

RLS Policy: `SELECT/INSERT/UPDATE/DELETE só se usuario_id = auth.uid()`

#### `certificados`
```sql
id (UUID, PK)
usuario_id (UUID, FK → auth.users)
cliente_id (UUID, FK → clientes)
tipo (text: 'e-CNPJ'/'e-CPF')
data_emissao (date)
data_validade (date)
responsavel_id (UUID, FK → auth.users)
status (text: 'válido'/'vencido', calculado)
criado_em (timestamp)
atualizado_em (timestamp)
```

RLS Policy: `SELECT/INSERT/UPDATE/DELETE só se usuario_id = auth.uid()`

### 4.3 Tabela de Usuários

#### `colaboradores`
```sql
id (UUID, PK, FK → auth.users.id)
nome (text)
email (text, unique)
cargo (text, nullable)
role (text: 'admin'/'user', default 'user')
ativo (boolean, default true)
criado_em (timestamp)
```

RLS Policy: `SELECT * pra todos; INSERT/UPDATE/DELETE só admin`

---

## 5. Autenticação e Autorização

### 5.1 Fluxo de Login

1. Usuário entra na URL do app → Vercel serve `index.html`
2. JavaScript checa se tem token válido em `localStorage`
   - **Se sim:** pula pro Dashboard
   - **Se não:** mostra tela de Login
3. Usuário digita email + senha
4. JavaScript chama `supabase.auth.signInWithPassword(email, senha)`
5. Supabase valida no banco de auth → retorna JWT
6. JavaScript guarda token em `localStorage` e `sessionStorage`
7. Todas as requisições seguintes incluem o token no header `Authorization: Bearer <token>`
8. Supabase valida o token e aplica RLS (Row-Level Security) — garante que usuário só vê dados dele

### 5.2 Logout

- Botão "Sair" no header do app
- Supabase invalida o token
- JavaScript limpa `localStorage` e `sessionStorage`
- Redireciona pra tela de Login

### 5.3 Criando Contas de Novos Colaboradores

**Processo:**
1. Você (Amanda) entra no Supabase dashboard
2. Va em **Authentication > Users**
3. Clica em **+ Create new user**
4. Digita email + senha temporária do colaborador
5. Supabase envia link de confirmação (opcional)
6. Colaborador faz login com essas credenciais na primeira vez
7. Na tabela `colaboradores`, você adiciona nome, cargo (preencher: id, nome, email, cargo, role='user')

**Primeiro login do colaborador:**
- Faz login com email + senha
- Sistema detecta que é primeira vez
- Se houver dados compartilhados já criados, ele vê (Processos, Clientes, Fluxos)
- Começa com Tarefas, Prazos, etc vazios (só dele)

### 5.4 Permissões (RLS)

| Tabela | Admin | User | Detalhes |
|---|---|---|---|
| `processos` | R/W/D | R | Só admin cria/edita/deleta |
| `clientes` | R/W/D | R | Só admin |
| `fluxos` | R/W/D | R | Só admin |
| `tarefas_pessoais` | R | R/W/D próprias | Cada um gerencia suas |
| `tarefas_equipe` | R | R/W/D criadas | Quem criou gerencia; quem recebeu vê |
| `prazos` | R | R/W/D próprios | Cada um gerencia seus |
| `certidoes` | R | R/W/D próprios | Cada um gerencia seus |
| `certificados` | R | R/W/D próprios | Cada um gerencia seus |

**Nota:** "admin" será apenas você (Amanda) por enquanto. Depois, você consegue promover colaboradores via Supabase dashboard.

---

## 6. Migração de Dados (localStorage → Supabase)

### 6.1 Quando Acontece

Na **primeira vez** que você faz login após publicar, um script JavaScript detecta:
- localStorage tem dados (`processos`, `clientes`, etc)
- Supabase está vazio
- Automaticamente copia tudo

### 6.2 Mapeamento de Dados

| localStorage | → | Supabase | Notas |
|---|---|---|---|
| `processos` | → | `processos` | `criado_por` = seu user_id |
| `clientes` | → | `clientes` | `criado_por` = seu user_id |
| `historico_clientes` | → | `historico_clientes` | Preserva datas e anotações |
| `fluxos` | → | `fluxos` | `criado_por` = seu user_id |
| (passos dentro de fluxos) | → | `passos_fluxo` | Estrutura completa |
| `minhas_tarefas` | → | `tarefas_pessoais` | `usuario_id` = seu user_id |
| `tarefas_equipe` | → | `tarefas_equipe` | `criado_por` = seu user_id |
| `prazos` | → | `prazos` | `usuario_id` = seu user_id |
| `certidoes` | → | `certidoes` | `usuario_id` = seu user_id |
| `certificados` | → | `certificados` | `usuario_id` = seu user_id |

### 6.3 Segurança

- Script só roda se o usuário está autenticado
- `usuario_id` no banco é sempre `auth.uid()` (autenticado pelo Supabase)
- RLS garante que dados não podem ser movidos entre usuários
- Depois que migra, localStorage continua como **cache local** (offline)

---

## 7. Refatoração do Código Frontend

### 7.1 Estrutura de Arquivos (antes → depois)

**Antes:**
```
aula-2/app/
  index.html
  style.css
  app.js
  processos.js
  tarefas-equipe.js
  minhas-tarefas.js
  prazos.js
  certidoes.js
  certificados.js
  clientes.js
  fluxos.js
  dashboard.js
  logo-*.png
```

**Depois:**
```
aula-2/
  app/
    index.html               (+ tela de login)
    style.css
    supabase-config.js       (NOVO)
    app.js                   (+ auth)
    login.js                 (NOVO)
    processos.js             (refatorado)
    tarefas-equipe.js        (refatorado)
    minhas-tarefas.js        (refatorado)
    prazos.js                (refatorado)
    certidoes.js             (refatorado)
    certificados.js          (refatorado)
    clientes.js              (refatorado)
    fluxos.js                (refatorado)
    dashboard.js             (refatorado)
    migration.js             (NOVO: localStorage → Supabase)
    logo-*.png
  vercel.json               (NOVO)
  package.json              (NOVO)
  .gitignore                (NOVO)
  .env.example              (NOVO)
```

### 7.2 Padrão de Refatoração

**Antes (localStorage):**
```javascript
// Salvar
function salvarProcesso(processo) {
  const processos = JSON.parse(localStorage.getItem('processos') || '[]');
  processos.push(processo);
  localStorage.setItem('processos', JSON.stringify(processos));
}

// Carregar
function carregarProcessos() {
  return JSON.parse(localStorage.getItem('processos') || '[]');
}
```

**Depois (Supabase):**
```javascript
// Salvar
async function salvarProcesso(processo) {
  const { error } = await supabase
    .from('processos')
    .insert({
      nome: processo.nome,
      departamento: processo.departamento,
      codigo: processo.codigo,
      link_drive: processo.linkDrive,
      link_youtube: processo.linkYoutube,
      status: processo.status,
      observacoes: processo.observacoes,
      criado_por: usuario_id
    });
  if (error) throw error;
}

// Carregar
async function carregarProcessos() {
  const { data, error } = await supabase
    .from('processos')
    .select('*');
  if (error) throw error;
  return data;
}
```

**Mudanças-chave:**
- Funções viram `async`
- `localStorage.getItem/setItem` → `supabase.from().select/insert/update/delete`
- Erros precisam ser tratados
- Dados sempre vêm do Supabase (não do cache local)

### 7.3 Novos Arquivos

**`supabase-config.js`:**
```javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

**`login.js`:**
- Tela de login (email + senha)
- Função `fazerLogin(email, senha)`
- Função `fazerLogout()`
- Função `verificarAutenticacao()` (roda ao carregar o app)

**`migration.js`:**
- Função `migrarDadosLocalStorage()` (roda na primeira vez)
- Copia dados de `localStorage` → Supabase
- Marca como migrado pra não rodar novamente

### 7.4 Mudanças em `index.html`

- Adiciona tela de Login (nova seção)
- Adiciona `manifest.json` (PWA)
- Adiciona imports dos scripts:
  ```html
  <script type="module" src="supabase-config.js"></script>
  <script type="module" src="app.js"></script>
  <script type="module" src="login.js"></script>
  <script type="module" src="migration.js"></script>
  ```

### 7.5 Mudanças em `app.js`

- Adiciona check de autenticação no início
- Se não autenticado: mostra tela de Login
- Se autenticado: carrega dados do Supabase
- Adiciona botão "Sair" no header

---

## 8. Deployment

### 8.1 Passos (ordem)

1. **Criar repositório GitHub**
   - Fazer push de todo o código (app + config)
   - `.gitignore` exclui `.env.local` (não commitir chaves do Supabase)

2. **Criar projeto Supabase**
   - Criar banco + tabelas (via SQL script)
   - Ativar autenticação (email/senha)
   - Gerar chave pública anon + URL do projeto
   - Criar primeira conta admin (você)

3. **Conectar Vercel com GitHub**
   - Autorizar Vercel
   - Selecionar repositório
   - Configurar variáveis de ambiente:
     ```
     VITE_SUPABASE_URL=https://xxx.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJ...
     ```

4. **Primeira deploy**
   - Vercel faz build automático
   - App fica disponível em `alprox-processos.vercel.app`
   - Ou domínio customizado seu (ex: `processos.alprox.com.br`)

5. **Testar fluxo completo**
   - Abrir URL no navegador
   - Fazer login com sua conta
   - Dados migram de localStorage → Supabase
   - Todas as funcionalidades funcionam igual

### 8.2 Configuração Vercel (`vercel.json`)

```json
{
  "buildCommand": "",
  "outputDirectory": "app",
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

**Nota:** `buildCommand: ""` = sem build, só serve os arquivos estáticos

### 8.3 Configuração Supabase

**Variáveis de ambiente (`app/.env.example`):**
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Nota:** Você precisa copiar os valores reais do painel Supabase e adicionar no dashboard Vercel (não commitir no Git)

---

## 9. PWA (Progressive Web App)

### 9.1 Arquivo `manifest.json`

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
  ]
}
```

### 9.2 Mudança em `index.html`

Adicionar no `<head>`:
```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#2d7a4a">
<meta name="description" content="App de gerenciamento de processos ALPROX">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="green">
<meta name="apple-mobile-web-app-title" content="Alprox">
<link rel="apple-touch-icon" href="logo-simbolo-verde.png">
```

### 9.3 Resultado

- Usuário abre a URL no Safari/Chrome mobile
- Aparece botão "Instalar app" (ou "Adicionar à tela inicial")
- Clica → app fica instalado como ícone na tela inicial
- Abre com a cor verde de tema
- Funciona como app nativo (sem barra de endereço visível)
- Precisa internet pra funcionar (não é offline-capable)

---

## 10. Segurança

### 10.1 Proteções Implementadas

1. **JWT Token** — Supabase usa JWT assinado; client não consegue falsificar
2. **Row-Level Security (RLS)** — PostgreSQL valida no servidor; usuário só acessa seus dados
3. **HTTPS** — Vercel usa HTTPS por padrão; comunicação encriptada
4. **Variáveis de ambiente** — chaves do Supabase não ficam no código (no Vercel dashboard)
5. **Autenticação do Supabase** — senhas são criptografadas no banco; Supabase gerencia segurança

### 10.2 Boas Práticas Futuras

- Sempre usar HTTPS (Vercel garante)
- Nunca commitar `.env` no Git (`.gitignore` previne)
- Periodicamente revisar permissões no Supabase
- Se publicar pra produção, usar domínio customizado (ex: `processos.alprox.com.br`)

---

## 11. Timeline de Implementação

| Fase | Tarefa | Tempo |
|---|---|---|
| **Setup Supabase** | Criar projeto + tabelas + RLS policies | 30 min |
| **Refatoração código** | Migrar 10 módulos localStorage → Supabase | 2 horas |
| **Tela de Login** | Criar formulário + integrar autenticação | 30 min |
| **Migração de dados** | Script automático localStorage → Supabase | 30 min |
| **Deploy Vercel** | Conectar GitHub + configurar variáveis | 30 min |
| **PWA** | Criar manifest + meta tags | 15 min |
| **Testes** | Testar fluxo completo (login, dados, offline) | 30 min |
| **TOTAL** | | **~5-6 horas** |

---

## 12. Checklist de Sucesso

- [ ] Supabase projeto criado com todas as tabelas
- [ ] RLS policies ativas e testadas
- [ ] Frontend refatorado (localStorage → Supabase)
- [ ] Tela de Login funcional
- [ ] Migração de dados automática na primeira vez
- [ ] App publicado em Vercel com URL acessível
- [ ] PWA instalável no celular (iOS + Android)
- [ ] Todos os módulos funcionam igual (Processos, Tarefas, Prazos, etc)
- [ ] Colaboradores conseguem fazer login e ver dados compartilhados
- [ ] Dados pessoais isolados por usuário (RLS funcionando)

---

## 13. Próximos Passos (Fase 2 — depois de publicar)

1. **Notificações** — push notifications de prazos vencendo
2. **Relatórios** — dashboards com estatísticas por período
3. **Integrações** — WhatsApp, email, Google Calendar
4. **Offline-first** — Service Worker pra funcionar sem internet
5. **Mobile app nativo** — versão iOS/Android via React Native (opcional)

---

**Fim do Design Document**
