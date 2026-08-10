# Instruções: Deploy no Vercel — Task 4.2

**Status:** Preparação pronta para deploy  
**Data:** 2026-08-03  
**App:** Alprox Processos (Gerenciamento de Processos com Supabase)

---

## ✅ Pré-requisitos

- [x] Código da app preparado em `aula-2/app`
- [x] Git inicializado com commits prontos
- [x] Arquivos de config criados:
  - `vercel.json` — configuração de roteamento (SPA)
  - `package.json` — metadados do projeto
  - `.gitignore` — exclui `.env` e node_modules
  - `.env.example` — template de variáveis de ambiente
- [x] Supabase credentials configuradas em `aula-2/app/supabase-config.js`
- [x] **Repositório GitHub criado e push feito** (veja `GITHUB-PUSH-INSTRUCTIONS.md`)

---

## ⚠️ Pré-requisito Crítico: Push no GitHub

**Antes de fazer deploy no Vercel, você DEVE ter:**

1. ✅ Criado repositório público em https://github.com/new (`alprox-processos`)
2. ✅ Feito push do código local:
   ```bash
   git remote add origin https://github.com/<seu-usuario>/alprox-processos.git
   git branch -M main
   git push -u origin main
   ```
3. ✅ Verificado que o repositório está visível em https://github.com/<seu-usuario>/alprox-processos

**Se ainda não fez isso, veja:** `GITHUB-PUSH-INSTRUCTIONS.md`

---

## Passo 1: Conectar GitHub com Vercel

1. Abra: https://vercel.com/import
2. Você verá uma tela de login. Escolha uma opção:
   - **Recomendado:** "Continue with GitHub" (mais fácil para deploy automático)
   - Ou faça login com email

3. Se escolheu GitHub, autorize a aplicação Vercel acessar seus repositórios

4. Você será redirecionado para página "Import Project from Git"

---

## Passo 2: Selecionar Repositório

1. Na seção **"Select a Git Repository"**, procure por `alprox-processos`
2. Clique no repositório quando aparecer
3. Vercel vai reconhecer automaticamente:
   - **Project Name:** `alprox-processos` (pode modificar se desejar)
   - **Framework Preset:** Deixe como "Other" (app é HTML/JS puro, não precisa build)

---

## Passo 3: Configurar Build e Output

Verifique se os seguintes valores estão corretos:

```
Build Command:        [deixe em branco]
Output Directory:     aula-2/app
Install Command:      [deixe em branco]
```

Esses valores já estão em `vercel.json`, então Vercel deve preencher automaticamente.

---

## Passo 4: Configurar Environment Variables

Vercel precisa das credenciais do Supabase para a app funcionar.

**Na seção "Environment Variables", adicione:**

| Nome | Valor | Descrição |
|------|-------|-----------|
| `VITE_SUPABASE_URL` | `https://aefiardlggehjlnrjavz.supabase.co` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_JtZuePMhw2uiejnElWtbZA_NT7hGbPf` | Chave pública do Supabase |

**Como adicionar:**
1. Clique em "Add"
2. Digite o **Name** (ex: `VITE_SUPABASE_URL`)
3. Digite o **Value** (ex: `https://aefiardlggehjlnrjavz.supabase.co`)
4. Clique em "Add"
5. Repita para a segunda variável

**Nota:** Essas variáveis de ambiente **não são obrigatórias** porque a app já tem as credenciais hardcoded em `aula-2/app/supabase-config.js`. Mas é **boa prática** adicioná-las para:
- Facilitar mudanças futuras sem editar código
- Usar diferentes credenciais em desenvolvimento vs. produção

---

## Passo 5: Deploy

1. Clique em **"Deploy"**
2. Vercel vai:
   - Clonar seu repositório
   - Copiar arquivos de `aula-2/app` para a raiz do build
   - Publicar no URL gerado (ex: `alprox-processos.vercel.app`)

3. Aguarde ~1-2 minutos para o deploy completar
4. Você verá a mensagem: **"Congratulations! Your project has been successfully deployed"**

---

## Passo 6: Verificar Deploy

Após sucesso, você receberá um URL tipo:
```
https://alprox-processos.vercel.app
```

**Teste a app:**
1. Abra o URL no navegador
2. Teste login com um usuário criado no Supabase
3. Verifique se as páginas carregam (dashboard, clientes, processos, etc)
4. Verifique o console do navegador (F12 > Console) para erros

---

## Deploy Automático (Após Primeiro Deploy)

Agora, toda vez que você fizer push no branch `main`:
1. Vercel detecta automaticamente o novo commit
2. Faz rebuild e deploy
3. Seu site é atualizado em minutos

Não precisa fazer nada manual!

---

## Possíveis Problemas e Soluções

### ❌ "Repository not found" ou "Access denied"
**Causa:** GitHub não está conectado ou repositório é privado  
**Solução:**
1. Verifique se o repositório existe em https://github.com/<seu-usuario>/alprox-processos
2. Se é **Private**, mude para **Public** no GitHub > Settings > Danger Zone > Change Repository Visibility
3. Reconecte GitHub no Vercel: https://vercel.com/settings/integrations/github

### ❌ Deploy falha com erro no build
**Causa:** Arquivo `vercel.json` está incorreto  
**Solução:** Verifique:
```json
{
  "buildCommand": "",
  "outputDirectory": "aula-2/app",
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### ❌ App carrega mas fica em branco ou mostra erro
**Causa:** Environment variables não foram configuradas OU credenciais do Supabase estão incorretas  
**Solução:**
1. Verifique se as env vars foram adicionadas no Vercel (Project Settings > Environment Variables)
2. Verifique credenciais do Supabase em `aula-2/app/supabase-config.js`
3. Abra o console do navegador (F12 > Console) e procure por erros de autenticação Supabase

### ❌ "404 Not Found" em páginas (ex: /dashboard)
**Causa:** Roteamento SPA não está configurado  
**Solução:** Verifique se `vercel.json` tem a rota correta:
```json
"routes": [
  { "src": "/(.*)", "dest": "/index.html" }
]
```

### ❌ Imagens ou CSS não carregam
**Causa:** Caminhos relativos podem estar errados  
**Solução:**
1. Abra DevTools (F12 > Network)
2. Veja o erro 404 dos arquivos
3. Corrija os caminhos em `aula-2/app/index.html`

---

## Próximas Etapas (Task 4.3)

Após deploy bem-sucedido no Vercel:

1. **Monitoramento:** Acompanhe logs no Vercel Dashboard
2. **Domínio Customizado:** Adicione domínio próprio (vercel.com/settings)
3. **CI/CD Avançado:** Configure workflows de teste antes de deploy
4. **Backups:** Configure backups do banco de dados Supabase

---

## Resumo Arquivos Envolvidos

| Arquivo | Função | Status |
|---------|--------|--------|
| `vercel.json` | Configuração de deploy (roteamento SPA) | ✅ Pronto |
| `package.json` | Metadados do projeto | ✅ Pronto |
| `.gitignore` | Exclui `.env` e arquivos sensíveis | ✅ Pronto |
| `.env.example` | Template de variáveis | ✅ Pronto |
| `aula-2/app/` | Código da aplicação | ✅ Pronto |
| `aula-2/app/supabase-config.js` | Credenciais Supabase | ✅ Pronto |

---

## Verificação Final

Antes de clicar em "Deploy" no Vercel, confirme:

- [ ] Repositório GitHub existe e é público
- [ ] Código foi feito push no branch `main`
- [ ] Você está logado no Vercel (vercel.com)
- [ ] Vercel consegue acessar seu repositório GitHub
- [ ] `vercel.json` está correto (buildCommand vazio, outputDirectory = `aula-2/app`)
- [ ] `aula-2/app/` contém todos os arquivos da app

---

## Contato / Dúvidas

Se algo não funcionar:
1. Verifique o console do navegador (F12)
2. Veja logs de deploy no Vercel (vercel.com/dashboard)
3. Consulte documentação: https://vercel.com/docs/concepts/deployments/overview

