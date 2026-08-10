# Design: Tela de Signup (Criar Conta)

**Data:** 2026-08-10  
**Projeto:** Alprox Processos  
**Feature:** Signup - Permitir usuários criarem conta diretamente na app

---

## 1. Visão Geral

Implementar uma tela de **"Criar Conta"** que permite novos usuários se registrarem com email e senha, sem precisar acessar o Supabase Dashboard.

**Objetivo:** Facilitar onboarding de novos colaboradores.

**Critérios de sucesso:**
- ✅ Usuário consegue preencher email e senha
- ✅ Signup valida dados (email formato, senhas iguais)
- ✅ Usuário é criado no Supabase Auth
- ✅ Colaborador é criado na tabela `colaboradores`
- ✅ Usuário entra automaticamente após signup
- ✅ Mensagens de erro claras se algo falhar

---

## 2. Arquitetura

### 2.1 Componentes

**Tela de Autenticação (index.html)**
- Seção `#tela-login` existente será expandida
- Dois estados: "modo login" e "modo signup"
- Mesma caixa `login-box`, conteúdo muda

**Módulo de Autenticação (login.js)**
- Nova função: `fazerSignup(email, senha, senhaConfirmacao)`
- Nova função: `mudarParaSignup()` (mostra/esconde formulário)
- Nova função: `mudarParaLogin()` (volta ao login)
- Reutiliza `supabase.auth.signUp()` e criação de colaborador

**Supabase Config (supabase-config.js)**
- Sem mudanças (já exporta `supabase`)

### 2.2 Fluxo de Dados

```
User Input (email, senha, senhaConfirmacao)
    ↓
Validação Local (formato, igualdade)
    ↓
supabase.auth.signUp(email, senha)
    ↓
Cria User em auth.users
    ↓
Cria registro em colaboradores
    ↓
supabase.auth.signInWithPassword() [automático]
    ↓
Sessão ativa → Dashboard
```

---

## 3. Interface (HTML/CSS)

### 3.1 Formulário de Signup

**Novos elementos no `#login-box`:**

```html
<!-- Estado: Signup -->
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

**Modificação no formulário de login:**
- Adicionar link "Criar conta" abaixo do botão "Entrar"

```html
<!-- No final do login-form -->
<p style="text-align: center; margin-top: 1rem; font-size: 0.9rem;">
  Não tem conta? <a href="#" id="link-criar-conta" style="color: var(--verde); cursor: pointer;">Criar uma</a>
</p>
```

### 3.2 CSS

Reutilizar estilos existentes:
- `btn-primario`, `campo`, `erro`, `escondido`
- Sem novos estilos necessários

---

## 4. Lógica (JavaScript - login.js)

### 4.1 Funções Principais

**`fazerSignup(email, senha, senhaConfirmacao)`**
- Validar email (regex básico)
- Validar senhas iguais
- Chamar `supabase.auth.signUp()`
- Se sucesso, criar colaborador e fazer login automático
- Se erro, mostrar mensagem

**`mudarParaSignup()`**
- Ocultar formulário de login
- Mostrar formulário de signup
- Limpar erros anteriores

**`mudarParaLogin()`**
- Ocultar formulário de signup
- Mostrar formulário de login
- Limpar erros anteriores

### 4.2 Validações (Client-Side)

```javascript
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarSignup(email, senha, senhaConfirmacao) {
  if (!validarEmail(email)) return 'Email inválido';
  if (senha.length < 1) return 'Senha é obrigatória';
  if (senha !== senhaConfirmacao) return 'Senhas não conferem';
  return null; // Válido
}
```

### 4.3 Fluxo de Signup

1. Usuário clica "Criar conta"
2. Formulário de signup aparece
3. Usuário preenche email, senha, confirma senha
4. Clica "Criar Conta"
5. Validação local passa
6. Chama `supabase.auth.signUp()` com email e senha
7. Se sucesso:
   - Cria registro em `colaboradores` (igual ao login)
   - Chama `fazerLogin()` automaticamente
   - Vai pro dashboard
8. Se erro (email já existe):
   - Mostra mensagem em vermelho
   - Usuário pode corrigir ou voltar

---

## 5. Tratamento de Erros

| Erro | Mensagem | Ação |
|------|----------|------|
| Email inválido | "Email inválido" | Destaca campo |
| Senhas não conferem | "Senhas não conferem" | Limpa campos |
| Email já registrado | "Este email já está registrado" | Sugere fazer login |
| Erro Supabase | "Erro ao criar conta. Tente novamente" | Mostra erro genérico |

---

## 6. Testes (Manual)

- [ ] Criar conta com email novo → entra na app
- [ ] Tentar criar com email já registrado → erro claro
- [ ] Tentar com senhas diferentes → erro
- [ ] Tentar com email inválido → erro
- [ ] Clicar "Voltar" no signup → volta ao login
- [ ] Clicar "Já tem conta?" no login → vai pro signup
- [ ] Novo usuário aparece em Supabase > Auth > Users
- [ ] Novo usuário aparece em `colaboradores` table

---

## 7. Arquivos Afetados

| Arquivo | Mudança | Tipo |
|---------|---------|------|
| `aula-2/app/index.html` | Adiciona formulário de signup | Novo HTML |
| `aula-2/app/login.js` | Adiciona funções de signup | Novo código |
| `aula-2/app/style.css` | Nenhuma (reutiliza estilos) | Nenhuma |

---

## 8. Não Incluído (YAGNI)

- ❌ Validação de força de senha
- ❌ Confirmação por email
- ❌ Recuperação de senha (futuro)
- ❌ Social login (futuro)
- ❌ Termos de serviço obrigatórios

---

## Notas

- **Compatibilidade:** Usa mesmos padrões que login existente
- **Segurança:** Supabase Auth criptografa senha automaticamente
- **UX:** Entrada automática pós-signup é melhor que forçar novo login
- **Escalabilidade:** Sem dependências novas, usa infraestrutura existente
