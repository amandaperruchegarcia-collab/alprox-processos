# Signup Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar tela de "Criar Conta" que permite novos usuários se registrarem com email e senha, entrando automaticamente após signup.

**Architecture:** Expandir a tela de login existente com um segundo formulário (signup). Reutilizar validações, estilos e padrão de autenticação já estabelecidos. Sem dependências novas — apenas Supabase Auth que já existe.

**Tech Stack:** 
- Supabase Auth (`supabase.auth.signUp()`)
- HTML/CSS/JS puro (sem frameworks)
- Padrão de módulos ES6 existente

---

## Global Constraints

- Sem validação de força de senha obrigatória
- Sem confirmação por email
- Entrada automática após signup (sem forçar novo login)
- Link "Criar conta" abaixo do botão "Entrar" na tela de login
- Reutilizar estilos existentes (`btn-primario`, `campo`, `erro`)
- Usar mesmo padrão de tratamento de erros que login

---

## File Structure

### Files Modified
- **`aula-2/app/index.html`**
  - Adicionar formulário de signup (`#signup-form`) dentro de `#login-box`
  - Adicionar link "Criar conta" no formulário de login
  - Adicionar link "Voltar" no formulário de signup

- **`aula-2/app/login.js`**
  - Adicionar funções: `validarEmail()`, `validarSignup()`, `fazerSignup()`
  - Adicionar funções: `mudarParaSignup()`, `mudarParaLogin()`
  - Adicionar event listeners para buttons e formulário de signup

### Files Not Modified
- `aula-2/app/supabase-config.js` (já exporta tudo que precisa)
- `aula-2/app/style.css` (reutiliza estilos existentes)

---

## Tasks

### Task 1: Adicionar HTML do Formulário de Signup

**Files:**
- Modify: `aula-2/app/index.html:36-62` (dentro de `#login-box`)

**Interfaces:**
- Consumes: DOM elements existentes (`#login-box`, `#login-form`)
- Produces: Elements: `#signup-form`, `#signup-email`, `#signup-senha`, `#signup-senha-confirma`, `#signup-erro`, `#link-criar-conta`, `#link-voltar-login`

- [ ] **Step 1: Abrir o arquivo index.html**

- [ ] **Step 2: Localizar o fechamento do `#login-form` (linha ~60)**

Procure por:
```html
        </form>
      </div>
    </section>
```

- [ ] **Step 3: Adicionar link "Criar conta" antes do fechamento de `#login-form`**

Insira isto **ANTES** do `</form>` do login:

```html
          <p style="text-align: center; margin-top: 1rem; font-size: 0.9rem;">
            Não tem conta? <a href="#" id="link-criar-conta" style="color: var(--verde); cursor: pointer;">Criar uma</a>
          </p>
```

Ficará assim:
```html
        <p id="login-erro" class="erro" style="margin-top: 1rem; display: none; text-align: center;"></p>
          <p style="text-align: center; margin-top: 1rem; font-size: 0.9rem;">
            Não tem conta? <a href="#" id="link-criar-conta" style="color: var(--verde); cursor: pointer;">Criar uma</a>
          </p>
        </form>
```

- [ ] **Step 4: Adicionar formulário de signup logo após o `</form>` do login**

Insira isto **APÓS** o `</form>` do login (mas antes do fechamento de `#login-box`):

```html
        <form id="signup-form" class="escondido">
          <div class="campo">
            <label for="signup-email">Email</label>
            <input type="email" id="signup-email" required placeholder="seu@email.com">
          </div>
          <div class="campo">
            <label for="signup-senha">Senha</label>
            <input type="password" id="signup-senha" required placeholder="••••••••">
          </div>
          <div class="campo">
            <label for="signup-senha-confirma">Confirmar Senha</label>
            <input type="password" id="signup-senha-confirma" required placeholder="••••••••">
          </div>
          <button type="submit" class="btn-primario" style="width: 100%; margin-top: 1rem;">
            Criar Conta
          </button>
          <p id="signup-erro" class="erro" style="margin-top: 1rem; display: none; text-align: center;"></p>
          <p style="text-align: center; margin-top: 1rem; font-size: 0.9rem;">
            Já tem conta? <a href="#" id="link-voltar-login" style="color: var(--verde); cursor: pointer;">Fazer login</a>
          </p>
        </form>
```

- [ ] **Step 5: Verificar visualmente que o HTML ficou correto**

Abra `index.html` no navegador e verifique:
- ✅ Tela de login carrega normalmente
- ✅ Link "Criar uma" aparece abaixo do botão "Entrar"
- ✅ (Formulário de signup fica escondido por enquanto — vai aparecer com JS)

- [ ] **Step 6: Commit**

```bash
git add aula-2/app/index.html
git commit -m "feat(signup): add signup form HTML to login screen"
```

---

### Task 2: Adicionar Funções de Validação no login.js

**Files:**
- Modify: `aula-2/app/login.js:1-15` (add new functions)

**Interfaces:**
- Consumes: Nothing
- Produces: Functions:
  - `validarEmail(email: string): boolean`
  - `validarSignup(email: string, senha: string, senhaConfirmacao: string): string|null`

- [ ] **Step 1: Abrir `aula-2/app/login.js`**

- [ ] **Step 2: Adicionar funções de validação no início do arquivo (após imports, antes de outras funções)**

Insira isto **APÓS** as linhas de import (após `import { supabase, inicializarSessao } from './supabase-config.js';`):

```javascript
/**
 * Valida se o email tem formato correto
 * @param {string} email - Email a validar
 * @returns {boolean} true se válido, false caso contrário
 */
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida os dados do signup
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha
 * @param {string} senhaConfirmacao - Confirmação de senha
 * @returns {string|null} null se válido, mensagem de erro caso contrário
 */
function validarSignup(email, senha, senhaConfirmacao) {
  if (!email || !email.trim()) {
    return 'Email é obrigatório';
  }
  if (!validarEmail(email)) {
    return 'Email inválido';
  }
  if (!senha || senha.length < 1) {
    return 'Senha é obrigatória';
  }
  if (!senhaConfirmacao || senhaConfirmacao.length < 1) {
    return 'Confirmação de senha é obrigatória';
  }
  if (senha !== senhaConfirmacao) {
    return 'Senhas não conferem';
  }
  return null; // Válido
}
```

- [ ] **Step 3: Verificar que o arquivo está syntactically correto**

No terminal:
```bash
node -c "aula-2/app/login.js"
```

Esperado: Sem erros de syntax

- [ ] **Step 4: Commit**

```bash
git add aula-2/app/login.js
git commit -m "feat(signup): add email and signup validation functions"
```

---

### Task 3: Adicionar Função fazerSignup()

**Files:**
- Modify: `aula-2/app/login.js:50-120` (add after `fazerLogin`)

**Interfaces:**
- Consumes: Functions: `validarSignup()`, `validarEmail()`, `inicializarSessao()`, `supabase`
- Produces: Function:
  - `fazerSignup(email: string, senha: string, senhaConfirmacao: string): Promise<void>`

- [ ] **Step 1: Localizar o final da função `fazerLogin()` (termina com `}` em torno da linha 79)**

- [ ] **Step 2: Adicionar função `fazerSignup()` logo após `fazerLogin()`**

Insira isto:

```javascript
/**
 * Registra um novo usuário e faz login automaticamente
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * @param {string} senhaConfirmacao - Confirmação de senha
 */
export async function fazerSignup(email, senha, senhaConfirmacao) {
  const signupForm = document.getElementById('signup-form');
  const signupErro = document.getElementById('signup-erro');
  const telaLogin = document.getElementById('tela-login');
  const telaDashboard = document.getElementById('tela-dashboard');

  try {
    // Validar dados
    const erroValidacao = validarSignup(email, senha, senhaConfirmacao);
    if (erroValidacao) {
      signupErro.textContent = erroValidacao;
      signupErro.style.display = 'block';
      return;
    }

    // Registrar usuário via Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: senha
    });

    if (error) throw error;

    const userId = data.user.id;

    // Criar entrada na tabela colaboradores
    const { error: erroInsert } = await supabase.from('colaboradores').insert({
      id: userId,
      nome: email.split('@')[0],
      email: email,
      cargo: null,
      role: 'user',
      ativo: true
    });

    if (erroInsert && erroInsert.code !== '23505') {
      console.warn('⚠️ Aviso ao criar colaborador:', erroInsert);
    } else if (!erroInsert) {
      console.log('✅ Novo colaborador criado:', email);
    }

    // Fazer login automático
    const { error: erroLogin } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha
    });

    if (erroLogin) throw erroLogin;

    // Inicializar sessão
    const autenticado = await inicializarSessao();
    if (autenticado) {
      // Ocultar login, mostrar dashboard
      telaLogin.classList.remove('ativa');
      telaDashboard.classList.add('ativa');

      // Limpar formulários
      document.getElementById('login-form').reset();
      signupForm.reset();
      signupErro.style.display = 'none';

      // Disparar evento
      window.dispatchEvent(new CustomEvent('usuario-logado', {
        detail: { usuario_id: window.supabase_usuario_id }
      }));

      console.log('✅ Signup e login bem-sucedidos para:', email);
    }
  } catch (error) {
    console.error('❌ Erro de signup:', error);
    signupErro.textContent = error.message || 'Erro ao criar conta. Tente novamente.';
    signupErro.style.display = 'block';
  }
}
```

- [ ] **Step 3: Verificar syntax**

```bash
node -c "aula-2/app/login.js"
```

- [ ] **Step 4: Commit**

```bash
git add aula-2/app/login.js
git commit -m "feat(signup): add fazerSignup function with validation and auto-login"
```

---

### Task 4: Adicionar Funções de Toggle (Signup ↔ Login)

**Files:**
- Modify: `aula-2/app/login.js:120-150` (add after `fazerSignup`)

**Interfaces:**
- Consumes: DOM elements: `#login-form`, `#signup-form`, `#login-erro`, `#signup-erro`
- Produces: Functions:
  - `mudarParaSignup(): void`
  - `mudarParaLogin(): void`

- [ ] **Step 1: Adicionar funções logo após `fazerSignup()`**

Insira isto:

```javascript
/**
 * Muda a tela de login para signup
 */
function mudarParaSignup() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginErro = document.getElementById('login-erro');
  const signupErro = document.getElementById('signup-erro');

  loginForm.classList.add('escondido');
  signupForm.classList.remove('escondido');
  loginErro.style.display = 'none';
  signupErro.style.display = 'none';

  // Limpar campos
  loginForm.reset();
  signupForm.reset();

  // Focar no email
  document.getElementById('signup-email').focus();
}

/**
 * Muda a tela de signup para login
 */
function mudarParaLogin() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginErro = document.getElementById('login-erro');
  const signupErro = document.getElementById('signup-erro');

  signupForm.classList.add('escondido');
  loginForm.classList.remove('escondido');
  loginErro.style.display = 'none';
  signupErro.style.display = 'none';

  // Limpar campos
  loginForm.reset();
  signupForm.reset();

  // Focar no email
  document.getElementById('login-email').focus();
}
```

- [ ] **Step 2: Verificar syntax**

```bash
node -c "aula-2/app/login.js"
```

- [ ] **Step 3: Commit**

```bash
git add aula-2/app/login.js
git commit -m "feat(signup): add mudarParaSignup and mudarParaLogin toggle functions"
```

---

### Task 5: Adicionar Event Listeners

**Files:**
- Modify: `aula-2/app/login.js:150-170` (add at end, before existing DOMContentLoaded)

**Interfaces:**
- Consumes: Functions: `fazerSignup()`, `mudarParaSignup()`, `mudarParaLogin()`, `fazerLogin()`
- Produces: Event listeners attached to: `#link-criar-conta`, `#link-voltar-login`, `#signup-form`

- [ ] **Step 1: Localizar o final do arquivo (antes de `// Event listener para o formulário de login`)**

- [ ] **Step 2: Adicionar event listeners para signup (ANTES do comentário `// Event listener para o formulário de login`)**

Insira isto:

```javascript
// Event listener para o link "Criar conta"
const linkCriarConta = document.getElementById('link-criar-conta');
if (linkCriarConta) {
  linkCriarConta.addEventListener('click', (e) => {
    e.preventDefault();
    mudarParaSignup();
  });
}

// Event listener para o link "Voltar para login"
const linkVoltarLogin = document.getElementById('link-voltar-login');
if (linkVoltarLogin) {
  linkVoltarLogin.addEventListener('click', (e) => {
    e.preventDefault();
    mudarParaLogin();
  });
}

// Event listener para o formulário de signup
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const signupErro = document.getElementById('signup-erro');
    signupErro.style.display = 'none';

    const email = document.getElementById('signup-email').value.trim();
    const senha = document.getElementById('signup-senha').value;
    const senhaConfirmacao = document.getElementById('signup-senha-confirma').value;

    await fazerSignup(email, senha, senhaConfirmacao);
  });
}

```

- [ ] **Step 3: Verificar syntax**

```bash
node -c "aula-2/app/login.js"
```

- [ ] **Step 4: Verificar visualmente no navegador**

1. Abra `aula-2/app/index.html` localmente (ou em vercel)
2. Clique em "Criar uma" → deve mostrar formulário de signup
3. Clique em "Fazer login" → deve voltar ao login
4. Preencha signup com dados válidos → deve funcionar

- [ ] **Step 5: Commit**

```bash
git add aula-2/app/login.js
git commit -m "feat(signup): add event listeners for signup form and navigation links"
```

---

### Task 6: Teste Completo do Fluxo de Signup

**Files:**
- No files changed (testing only)

**Interfaces:**
- Consumes: Everything from Tasks 1-5
- Produces: Verified working signup flow

- [ ] **Step 1: Push para GitHub**

```bash
git push
```

- [ ] **Step 2: Aguardar Vercel redeploy (1-2 minutos)**

Verifique em: https://vercel.com/dashboard

- [ ] **Step 3: Abrir a app no navegador**

https://alprox-processos.vercel.app

- [ ] **Step 4: Testar: Clique em "Criar uma"**

✅ Expected:
- Formulário de login desaparece
- Formulário de signup aparece com 3 campos
- Link "Fazer login" visível

- [ ] **Step 5: Testar validação: Tente criar conta com email inválido**

```
Email: invalido
Senha: 123456
Confirmar: 123456
```

✅ Expected: Mensagem "Email inválido"

- [ ] **Step 6: Testar validação: Tente com senhas diferentes**

```
Email: teste@exemplo.com
Senha: 123456
Confirmar: 654321
```

✅ Expected: Mensagem "Senhas não conferem"

- [ ] **Step 7: Testar sucesso: Crie uma conta real**

```
Email: novouser@alprox.com.br
Senha: MinhaSenh@123
Confirmar: MinhaSenh@123
```

Clique "Criar Conta"

✅ Expected:
- Entra automaticamente no dashboard
- Novo usuário aparece em Supabase > Authentication > Users
- Nova linha em `colaboradores` table com o email

- [ ] **Step 8: Testar erro: Tente criar conta com email já existente**

Use um email que já criou (ou seu email de teste)

✅ Expected: Mensagem "Este email já está registrado"

- [ ] **Step 9: Testar navegação: No signup, clique "Fazer login"**

✅ Expected: Volta para tela de login com formulário limpo

- [ ] **Step 10: Console check - não deve ter erros vermelhos**

Abra DevTools (F12) → Console

✅ Expected:
- ✅ Sessão inicializada...
- ✅ Novo colaborador criado...
- ✅ Login bem-sucedido...
- ❌ Nenhum erro em vermelho

---

### Task 7: Commit Final e Limpeza

**Files:**
- No files changed (summary only)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Clean git history, feature complete

- [ ] **Step 1: Verificar status do git**

```bash
git status
```

✅ Expected: "working tree clean"

- [ ] **Step 2: Ver log dos commits**

```bash
git log --oneline -5
```

✅ Expected: 5 commits recentes sobre signup

- [ ] **Step 3: Confirmar que tudo foi enviado**

```bash
git push
```

✅ Expected: Everything up-to-date

- [ ] **Step 4: Criar nota de conclusão**

Pronto! Feature de signup implementada com sucesso! ✅
