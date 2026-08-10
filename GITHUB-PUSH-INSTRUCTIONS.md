# Instruções: Criar GitHub Repo e Fazer Push

## Pré-requisito
- Git instalado e configurado em `C:\Users\Amanda\Desktop\workshop-criacao-app`
- Autenticação GitHub configurada (via SSH key ou token)

---

## Step 1: Criar Repositório no GitHub

1. Abra https://github.com/new
2. Preencha:
   - **Repository name:** `alprox-processos`
   - **Description:** `App de gerenciamento de processos ALPROX com autenticação multiusuário e banco de dados na nuvem`
   - **Visibility:** Escolha "Public" ou "Private" (recomendado: Private se for dado sensível)
   - Deixe o resto com padrões
3. Clique em **Create repository**

Você verá uma página com as instruções. Anote a URL do repositório:
```
https://github.com/<seu-usuario>/alprox-processos.git
```

---

## Step 2: Conectar Repositório Local com GitHub

Execute os seguintes comandos no PowerShell ou Bash:

```bash
cd "C:\Users\Amanda\Desktop\workshop-criacao-app"

# Adicionar remote (substitua <seu-usuario> pelo seu GitHub username)
git remote add origin https://github.com/<seu-usuario>/alprox-processos.git

# Renomear branch para main (GitHub padrão)
git branch -M main

# Fazer push inicial
git push -u origin main
```

Se pedir autenticação:
- **GitHub via HTTPS:** Use token pessoal (Settings > Developer settings > Personal access tokens)
- **GitHub via SSH:** Certifique-se de ter SSH key configurada

---

## Step 3: Verificar no GitHub

Abra https://github.com/<seu-usuario>/alprox-processos

Você deve ver:
- ✅ Todos os arquivos da pasta `aula-2/`
- ✅ Arquivos de config: `vercel.json`, `package.json`, `.gitignore`, `.env.example`
- ✅ Branch padrão: `main`
- ✅ `.env` **não aparece** (está em `.gitignore`)

---

## Possíveis Erros

### "fatal: not a git repository"
- Execute: `git init` (mas já temos `.git/`)
- Verifique pasta: `ls -la` deve mostrar `.git`

### "fatal: remote origin already exists"
- O remote foi adicionado antes
- Execute: `git remote remove origin` e tente novamente

### "fatal: authentication failed"
- GitHub precisa de autenticação via token
- No PowerShell:
  ```powershell
  git config --global user.name "seu-nome"
  git config --global user.email "seu-email@github.com"
  ```
- Gere token em: https://github.com/settings/tokens
- Ou configure SSH: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### "Permission denied (publickey)"
- SSH key não está configurada
- Use HTTPS em lugar de SSH:
  ```bash
  git remote set-url origin https://github.com/<seu-usuario>/alprox-processos.git
  ```

---

## Após Push Bem-sucedido

Próxima etapa: **Task 4.2 — Deploy na Vercel**

1. Abra https://vercel.com/import
2. Conecte GitHub account
3. Busque repositório `alprox-processos`
4. Configure environment variables (já estão em `.env.example`)
5. Deploy automático

---

## Status Atual

```bash
$ git log --oneline -1
615330b chore: prepare for Vercel deployment with config files

$ git status
On branch main
nothing to commit, working tree clean
```

✅ Tudo pronto para push!

