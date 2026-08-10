# Troubleshooting Pós-Deploy — Alprox Processos

**URL:** https://alprox-processos.vercel.app

Se você encontrou problemas após fazer deploy, este documento contém soluções comuns.

---

## Verificação Inicial (Sempre Fazer Primeiro!)

Antes de prosseguir com troubleshooting complexo, tente estas coisas simples:

1. **Hard Refresh**
   ```
   Windows/Linux: Ctrl + Shift + R
   macOS: Cmd + Shift + R
   ```
   - Isso limpa cache do navegador e recarrega arquivos frescos da Vercel

2. **Limpar Cookies e SessionStorage**
   - Abrir DevTools (F12)
   - Application > Cookies > selecionar site > Delete All
   - Application > Local Storage > site > Clear All
   - Application > Session Storage > site > Clear All
   - Recarregar página

3. **Fechar todas as abas do app e reabrir**
   - Se app estiver aberto em múltiplas abas, podem haver conflitos de sessão

4. **Testar em navegador anônimo/privado**
   - Chrome: Ctrl+Shift+N
   - Firefox: Ctrl+Shift+P
   - Safari: Cmd+Shift+N
   - Isso desabilita extensões e cache

---

## Problemas Comuns e Soluções

### 1. Tela de Login Não Carrega

#### Problema: "Página em branco" ou "Erro 404"

**Causas possíveis:**
- Deploy incompleto
- Arquivo `index.html` não foi enviado
- Rota Vercel misconfigured

**Solução:**
1. Verificar Vercel Dashboard (https://vercel.com/dashboard)
2. Abrir seu projeto
3. Verificar aba **Deployments**:
   - Status deve ser **READY** (verde)
   - Se estiver Building ou Failed, aguarde ou redeploy
4. Clicar em **Preview** — deve abrir seu app
5. Se Preview falha, redeploy:
   ```bash
   vercel --prod
   ```

#### Problema: "Cannot find module" ou "404 recursos"

**Causas possíveis:**
- Arquivos JS ou CSS não foram inclusos no deploy
- Caminhos de arquivo incorretos

**Solução:**
1. Verificar `vercel.json`:
   ```json
   {
     "buildCommand": "",
     "outputDirectory": "aula-2/app",
     "routes": [
       { "src": "/(.*)", "dest": "/index.html" }
     ]
   }
   ```
   - `outputDirectory` deve apontar para pasta correta
2. Verificar que todos os arquivos em `aula-2/app/` existem:
   - `index.html`
   - `app.js`, `login.js`, `supabase-config.js`, etc
   - `style.css`
   - Imagens (.png)
3. Se tudo OK, fazer hard refresh (Ctrl+Shift+R)

---

### 2. Login Falha com "Invalid login credentials"

#### Problema: Email/senha corretos mas login não funciona

**Causas possíveis:**
- Supabase URL ou chave incorretos em `supabase-config.js`
- CORS não habilitado no Supabase
- Usuário não existe ou senha errada

**Solução:**
1. Verificar credenciais Supabase em `aula-2/app/supabase-config.js`:
   ```javascript
   const SUPABASE_URL = 'https://aefiardlggehjlnrjavz.supabase.co';
   const SUPABASE_KEY = 'sb_publishable_JtZuePMhw2uiejnElWtbZA_NT7hGbPf';
   ```
   - Copiar URL e chave novamente de https://app.supabase.com > Settings > API
   - Verificar se são exatamente iguais (sem espaços)

2. Testar credenciais Supabase:
   - DevTools (F12 > Console)
   - Digitar:
   ```javascript
   console.log(SUPABASE_URL, SUPABASE_KEY);
   ```
   - Deve exibir URL e chave (sem errors)

3. Verificar que CORS está habilitado:
   - Supabase Dashboard > Settings > API
   - Em "CORS", deve estar habilitado ou com URL do seu app adicionada
   - Vercel URL padrão: `https://alprox-processos.vercel.app`

4. Verificar que usuário existe:
   - Supabase Dashboard > Authentication > Users
   - Ver se seu email (amandaperruchegarcia@gmail.com) está na lista
   - Status deve ser "Confirmed"

---

### 3. Dashboard Carrega Mas Dados Não Aparecem

#### Problema: Após login, telas de dados estão vazias

**Causas possíveis:**
- Supabase tabelas vazias (esperado na primeira vez)
- RLS policies bloqueando dados
- Migração localStorage não completou

**Solução:**
1. Verificar Console (F12 > Console):
   - Procurar por erros vermelhos relacionados a Supabase
   - Mensagens como "policy_violation", "unauthorized", etc

2. Se vê erro de RLS:
   ```
   violates row level security policy
   ```
   - RLS está funcionando (é esperado para segurança)
   - Dados vazios é OK — app recém-criado
   - Começar a adicionar dados (criar tarefas)

3. Verificar se migração completou:
   - Console deve mostrar: "✅ Migração concluída com sucesso!"
   - Se vir: "❌ Erro durante migração: ...", ver próxima seção

4. Se dados ainda não aparecem após criar:
   - Abrir Supabase Dashboard
   - Ir pra **SQL Editor**
   - Executar:
   ```sql
   SELECT * FROM minhas_tarefas LIMIT 10;
   ```
   - Se query retorna dados, o problema é no frontend (dados estão no banco)
   - Se query retorna vazio, dados não foram salvos

---

### 4. Erro Durante Migração de Dados

#### Problema: "❌ Erro durante migração" na console

**Causas possíveis:**
- Tabelas Supabase não existem
- RLS policies incorretos
- localStorage contém dados malformados

**Solução:**
1. Verificar no Supabase que tabelas existem:
   - Supabase Dashboard > Table Editor
   - Verificar se existem:
     - `processos`
     - `clientes`
     - `fluxos`
     - `minhas_tarefas`
     - `tarefas_equipe`
     - `prazos`
     - `certidoes`
     - `certificados`
     - `colaboradores`

2. Se faltam tabelas:
   - Rodar SQL de criação:
     - Supabase > SQL Editor
     - Colar script de `aula-2/sql/01-init-supabase.sql`
     - Executar
   - Rodar RLS policies:
     - Script de `aula-2/sql/02-rls-policies.sql`
     - Executar

3. Se tabelas existem e migration ainda falha:
   - DevTools (F12 > Application > Local Storage)
   - Procurar por `_migrado_supabase`
   - Se existe, deletar (vai tentar migração novamente)
   - Recarregar página

4. Se erro persiste:
   - Ver logs Supabase (próxima seção)

---

### 5. Erro de Autenticação "Unauthorized" ou "Invalid API Key"

#### Problema: Console mostra erro 401 ou 403 para requests Supabase

**Causas possíveis:**
- Chave Supabase expirada ou inválida
- Credenciais não foram commitadas corretamente
- Supabase API desabilitada

**Solução:**
1. Verificar credenciais em `supabase-config.js`:
   ```javascript
   const SUPABASE_URL = 'https://aefiardlggehjlnrjavz.supabase.co';
   const SUPABASE_KEY = 'sb_publishable_JtZuePMhw2uiejnElWtbZA_NT7hGbPf';
   ```

2. Se credenciais estão erradas, atualizar:
   - Supabase Dashboard > Settings > API
   - Copiar **Project URL** e **Anon Public Key**
   - Atualizar em `supabase-config.js`
   - Fazer commit e push:
     ```bash
     git add aula-2/app/supabase-config.js
     git commit -m "Fix: Update Supabase credentials"
     git push origin main
     ```
   - Vercel redeploy automaticamente (aguardar)

3. Verificar que chave está "anon public":
   - Deve começar com `sb_publishable_`
   - NÃO use a chave "service_role" (é privada)

4. Se error continua:
   - Regenerar chaves no Supabase:
     - Settings > API
     - Clicar regenerate próximo a "Anon Public Key"
     - Atualizar em código

---

### 6. Problema: "Blank Page" Após Login

#### Problema: Página preta ou branca após fazer login

**Causas possíveis:**
- JavaScript erro impedindo render
- CSS não carregou
- DOM não inicializou

**Solução:**
1. Abrir DevTools (F12 > Console):
   - Procurar erros vermelhos
   - Anotar mensagem de erro completa

2. Se vê erro do tipo "Cannot read property 'X' of null":
   - Significa que elemento HTML não foi encontrado
   - Verificar `index.html` que `<div id="...">` existe

3. Se vê erro "Unexpected token":
   - Erro de sintaxe em um arquivo JS
   - Procurar em qual arquivo (stack trace)

4. Se nenhum erro visível:
   - Tentar hard refresh (Ctrl+Shift+R)
   - Fechar abas abertas do app, reabrir
   - Testar em navegador anônimo

5. Se problema persiste:
   - Verificar logs Supabase (ver "Acessar Logs Supabase" abaixo)

---

### 7. Problema: App Funciona Localmente Mas Não em Produção

#### Problema: `npm run dev` funciona, mas Vercel falha

**Causas possíveis:**
- Variáveis de ambiente não configuradas
- Arquivos não inclusos no commit
- Caminhos de arquivo diferem (windows vs linux)

**Solução:**
1. Verificar que files foram commitados:
   ```bash
   git status
   ```
   - Deve estar limpo (no uncommitted changes)
   - Se há uncommitted, fazer commit:
   ```bash
   git add .
   git commit -m "Deploy fixes"
   git push origin main
   ```

2. Verificar Vercel build logs:
   - https://vercel.com/dashboard
   - Clicar no projeto
   - Abrir ultimo deployment
   - Ver aba **Logs**
   - Procurar por erros (vermelho)

3. Se build logs não mostram erro, verificar runtime logs:
   - Ainda no deployment
   - Aba **Runtime Logs**
   - Fazer ação no app que falha
   - Ver logs em tempo real

---

### 8. Problema: Performance Lenta

#### Problema: App leva mais de 3 segundos pra carregar

**Causas possíveis:**
- Internet lenta
- Supabase respondendo lentamente
- Assets grandes não otimizadas

**Solução:**
1. Verificar performance em DevTools:
   - F12 > Network
   - Ctrl+Shift+R (hard refresh com cache desabilitado)
   - Ver em "Finish": tempo total
   - Analisar qual asset demora mais

2. Se `supabase-config.js` ou similar demora:
   - Supabase pode estar lento
   - Verificar status: https://status.supabase.com

3. Se imagens (logo) demoram:
   - Verificar que imagens são otimizadas
   - Tamanho deve ser < 500KB

4. Se tudo está lento (não é relacionado a um asset):
   - Verificar conexão de internet
   - Tentar em outra rede

---

### 9. Problema: PWA Não Instala

#### Problema: Botão "Instalar app" não aparece em mobile

**Causas possíveis:**
- `manifest.json` não está correto
- Meta tags faltam
- HTTPS não funciona

**Solução:**
1. Verificar que HTTPS funciona:
   - URL deve ser `https://alprox-processos.vercel.app` (com 🔒)
   - Vercel HTTPS é automático

2. Verificar `manifest.json` em `aula-2/app/`:
   - Deve existir arquivo `manifest.json`
   - Deve conter:
   ```json
   {
     "name": "Alprox Processos",
     "short_name": "Alprox",
     "icons": [...],
     "start_url": "/",
     "display": "standalone",
     "theme_color": "#27ae60"
   }
   ```

3. Verificar que manifest está linkado em `index.html`:
   - `<link rel="manifest" href="/manifest.json">`

4. Verificar meta tags em `index.html`:
   - `<meta name="theme-color" content="#27ae60">`
   - `<meta name="apple-mobile-web-app-capable" content="yes">`

5. Se tudo OK, testar em Chrome mobile (Android):
   - Outros navegadores podem não suportar

---

### 10. Problema: Dados Não Sincronizam Entre Usuários

#### Problema: Um usuário cria tarefa, outro não vê

**Causas possíveis:**
- Dados são pessoais (minhas_tarefas) — só o criador vê (correto!)
- Se quer compartilhar, usar tabela diferente
- RLS policies estão funcionando (é segurança)

**Solução:**
1. Verificar o tipo de dado:
   - **Dados compartilhados**: processos, clientes, fluxos (todos veem)
   - **Dados pessoais**: minhas_tarefas, prazos (só o usuário vê)
   - **Dados de equipe**: tarefas_equipe (colaboradores da equipe veem)

2. Se quer que todos vejam:
   - Usar tabela compartilhada (processos)
   - OU adicionar RLS policy para ler dados de todos

3. Se quer que equipe acesse:
   - Verificar RLS policy em `tarefas_equipe`:
   ```sql
   ALTER TABLE tarefas_equipe ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Usuários veem tarefas da própria equipe" ON tarefas_equipe
     FOR SELECT USING (usuario_id = auth.uid());
   ```

---

## Acessar Logs e Diagnosticar

### 1. Logs Vercel

**Para ver o que aconteceu durante deploy:**

1. Ir para https://vercel.com/dashboard
2. Selecionar projeto `alprox-processos`
3. Abrir último **Deployment**
4. Ver aba **Logs** (build-time) ou **Runtime Logs** (erros em produção)
5. Procurar por erros (vermelho ou amarelo)

**Comum:**
- ✅ "deployed successfully" = tudo OK
- ⚠️ "warnings" = não crítico, mas revisar
- ❌ "error" = problema, ver mensagem completa

### 2. Logs Supabase

**Para ver o que aconteceu no banco de dados:**

1. Ir para https://app.supabase.com
2. Selecionar projeto `alprox-processos`
3. Abrir **Logs** no menu esquerdo
4. Filtrar por date, tipo (error, warning, etc)
5. Procurar por queries falhadas

**Comum:**
- Erro `401 Unauthorized`: token expirado ou chave errada
- Erro `violates row level security`: RLS bloqueou (esperado)
- Erro `column does not exist`: schema da tabela incorreto

### 3. Browser DevTools

**Para diagnóstico local:**

| Aba | O que Fazer | O que Procurar |
|-----|------------|-----------------|
| **Console** | Ver todos os logs e erros do JS | Erros vermelhos, warnings |
| **Network** | Ver todas as requisições HTTP | Status 200 (OK), 401 (auth), 500 (server) |
| **Application** | Ver dados armazenados localmente | Cookies, LocalStorage, SessionStorage |
| **Performance** | Análise de velocidade | Gráfico de carregamento, tempo total |

---

## Rollback (Desfazer Deploy)

Se deploy está quebrado e precisa voltar pra versão anterior:

### Opção 1: Redeploar Versão Anterior (Vercel)

1. https://vercel.com/dashboard
2. Selecionar projeto
3. Aba **Deployments**
4. Encontrar deployment anterior (antes do quebrado)
5. Clicar em **Redeploy**
6. Vercel redeploy automaticamente

### Opção 2: Reverter Código (Git)

```bash
# Ver histórico de commits
git log --oneline

# Reverter para commit específico
git revert <commit-id>  # cria novo commit de reverter
# OU
git reset --hard <commit-id>  # volta pra estado exato (destructivo)

# Fazer push
git push origin main

# Vercel redeploy automaticamente
```

---

## Contatos de Suporte

Se problema não foi resolvido, contatar:

### Supabase
- **Documentação:** https://supabase.com/docs
- **Status Page:** https://status.supabase.com
- **Discord Community:** https://discord.supabase.com
- **Support:** https://supabase.com/support (plano pago)

### Vercel
- **Documentação:** https://vercel.com/docs
- **Status Page:** https://www.vercel-status.com
- **Support:** https://vercel.com/support
- **Email:** support@vercel.com

### Seu Projeto
- **GitHub Issues:** [seu-repo]/issues
- **Contato Amanda:** amandaperruchegarcia@gmail.com

---

## Checklist de Diagnóstico Rápido

Se app está falhando, fazer isto em ordem:

- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Verificar Vercel deployment status (verde = OK)
- [ ] Verificar DevTools console (erros vermelhos?)
- [ ] Verificar DevTools network (status de requests)
- [ ] Verificar HTTPS (🔒 na URL)
- [ ] Testar em navegador anônimo
- [ ] Verificar Supabase logs
- [ ] Verificar credenciais Supabase em código
- [ ] Fazer rollback se tudo falhar

---

**Última atualização:** [preenchercomaadata]  
**Versão:** 1.0
