# 🚀 Como Publicar o App (Bem Simples!)

Vamos fazer tudo clicando no navegador. Sem terminal, sem confusão.

---

## PASSO 1: Criar repositório no GitHub

1. Abra https://github.com/new (ou vá no GitHub e clique em "New repository")

2. Preencha assim:
   - **Repository name:** `alprox-processos`
   - **Description:** App de gerenciamento de processos ALPROX
   - **Public** (deixar público)
   - **Add a README file** ✅ (marque essa opção)

3. Clique em **Create repository** (botão verde)

4. **Pronto!** Você criou o repositório vazio.

---

## PASSO 2: Upload dos arquivos (parte 1 - raiz)

Agora você vai subir os arquivos. Está no repositório vazio que acabou de criar.

1. Clique em **"Add file"** → **"Upload files"**

2. Arrastar os arquivos para o navegador (ou clique pra procurar):

```
Arquivos da RAIZ do projeto (c:\Users\Amanda\Desktop\workshop-criacao-app):
✅ vercel.json
✅ package.json
✅ .gitignore
✅ .env.example
✅ IMPLEMENTATION-COMPLETE.md
✅ DEPLOY-INSTRUCTIONS.md
✅ POST-DEPLOY-TESTING.md
✅ PWA-TESTING-GUIDE.md
✅ TROUBLESHOOTING-POST-DEPLOY.md
✅ GITHUB-PUSH-INSTRUCTIONS.md
```

3. Clique em **"Commit changes"** (botão verde, no final)

4. **Pronto!** Os arquivos da raiz estão lá.

---

## PASSO 3: Upload da pasta `aula-2`

Você precisa subir a pasta inteira `aula-2`. Vamos fazer assim:

1. Clique em **"Add file"** → **"Create new file"**

2. Na caixa de "Name your file", digite: `aula-2/.gitkeep` e aperte Tab

3. Clique em **"Commit changes"**

4. Agora clique em **"Add file"** → **"Upload files"**

5. **Selecione TODOS os arquivos dentro de `aula-2/app/`:**
   ```
   aula-2/app/
   ├── index.html
   ├── style.css
   ├── app.js
   ├── login.js
   ├── migration.js
   ├── supabase-config.js
   ├── processos.js
   ├── minhas-tarefas.js
   ├── tarefas-equipe.js
   ├── prazos.js
   ├── certidoes.js
   ├── certificados.js
   ├── clientes.js
   ├── fluxos.js
   ├── dashboard.js
   ├── manifest.json
   ├── logo-simbolo-verde.png
   ├── logo-simbolo-branco.png
   ├── logo-horizontal-verde.png
   ```

6. Ao upload, o GitHub vai **criar a pasta automaticamente**

7. Clique em **"Commit changes"**

8. Repita pra pasta `aula-2/sql/`:
   - MAPEAMENTO-TABELAS.md

---

## PASSO 4: Conectar com Vercel

Agora seu código está no GitHub. Vamos publicar na Vercel:

1. Abra https://vercel.com/import (ou https://vercel.com/new)

2. Faça login com GitHub (clique em "Continue with GitHub")

3. Procure pelo repositório `alprox-processos` e clique em **"Import"**

4. **Configure as variáveis de ambiente:**
   
   Clique em **"Environment Variables"** e adicione:
   
   ```
   Nome: VITE_SUPABASE_URL
   Valor: https://aefiardlggehjlnrjavz.supabase.co
   ```
   
   Clique em **"Add"**
   
   ```
   Nome: VITE_SUPABASE_ANON_KEY
   Valor: sb_publishable_JtZuePMhw2uiejnElWtbZA_NT7hGbPf
   ```
   
   Clique em **"Add"**

5. Clique em **"Deploy"** (botão grande no final)

6. **Aguarde 2-5 minutos** enquanto a Vercel faz o deploy

7. Quando terminar, vai mostrar uma URL tipo: `https://alprox-processos-abc123.vercel.app`

---

## ✅ PRONTO!

Quando o deploy terminar, você conseguirá acessar:

**URL:** https://alprox-processos.vercel.app (ou a URL que Vercel gerou)

**Login com:**
- Email: `amandaperruchegarcia@gmail.com`
- Senha: `Amanda@2024!Alprox`

---

## 🆘 Se algo der errado

Se der erro durante o upload ou deploy:
- Leia o arquivo **TROUBLESHOOTING-POST-DEPLOY.md** (está no repositório)
- Ou volte aqui e me avise qual foi o erro!

---

**Boa sorte! 🚀**
