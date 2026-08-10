# Guia de Testes de Instalação PWA - Alprox Processos

Esse guia contém todos os passos para testar a instalação do app como Progressive Web App (PWA) em dispositivos móveis.

**URL do app:** https://alprox-processos.vercel.app

**IMPORTANTE:** Estes testes devem ser executados APÓS o deploy em Vercel estar completo.

---

## 1. iOS (iPhone/iPad)

### Passos para Instalação

- [ ] Abrir Safari (não funciona em outros navegadores no iOS)
- [ ] Navegar até https://alprox-processos.vercel.app
- [ ] Esperar até que a página carregue completamente (aguarde ~3-5 segundos)
- [ ] Clique no botão **"Compartilhar"** (ícone de box com seta saindo, canto inferior direito)
- [ ] Scroll para baixo na lista de opções
- [ ] Procure por **"Adicionar à Tela Inicial"** 
  - Se não aparecer, pode significar que o manifest.json não está sendo reconhecido
  - Tente fazer refresh (Pull-to-refresh) e tentar novamente
- [ ] Clique em **"Adicionar à Tela Inicial"**
- [ ] Uma caixa de diálogo vai aparecer com a sugestão de nome
- [ ] Nome padrão deve ser **"Alprox"** (confirme)
- [ ] Clique no botão **"Adicionar"** (canto superior direito)
- [ ] Espere alguns segundos
- [ ] Volte à tela inicial (Home)
- [ ] Procure o ícone do app com **logo verde Alprox** (#2d7a4a)

### Validações Após Instalação

- [ ] **Ícone na tela inicial**
  - Aparece com logo verde do Alprox?
  - Rótulo diz "Alprox"?
  
- [ ] **Ao abrir o app**
  - Abre em modo tela cheia (sem barra de Safari)?
  - Barra status no topo exibe tema verde?
  
- [ ] **Teste de Funcionalidade**
  - [ ] Login funciona (use amandaperruchegarcia@gmail.com)
  - [ ] Consegue navegar entre telas/menu
  - [ ] CRUD funciona (criar tarefa, editar, deletar)
  - [ ] Logout funciona e volta para tela de login

### Resultado iOS
- [ ] PASSOU
- [ ] FALHOU (descreva o problema abaixo)

**Problema encontrado (se falhou):**
```
[descrever aqui]
```

---

## 2. Android (Chrome)

### Passos para Instalação

- [ ] Abrir **Google Chrome** (versão recente)
- [ ] Navegar até https://alprox-processos.vercel.app
- [ ] Esperar até que a página carregue completamente (~3-5 segundos)
- [ ] Verificar que a URL mostra cadeado 🔒 (HTTPS ativo)
- [ ] Clique no menu (⋮ três pontinhos, canto superior direito)
- [ ] Procure pela opção:
  - **"Instalar app"** (mais comum em Chrome moderno), ou
  - **"Adicionar à tela inicial"** (em versões mais antigas)
- [ ] Clique na opção de instalação
- [ ] Uma caixa de diálogo vai aparecer pedindo confirmação
- [ ] Clique no botão **"Instalar"** (canto inferior direito)
- [ ] Aguarde alguns segundos
- [ ] Um toast/notificação pode aparecer confirmando a instalação
- [ ] Abra a tela de apps (gaveta de aplicativos / App Drawer)
  - Deslize para cima a partir do fundo da tela, ou
  - Clique no ícone de "Mostrar apps" (se disponível)
- [ ] Procure por **"Alprox"** com **logo verde** (#2d7a4a)

### Validações Após Instalação

- [ ] **Ícone nos apps**
  - Aparece com logo verde do Alprox?
  - Nome diz "Alprox"?
  
- [ ] **Ao abrir o app**
  - Abre em modo tela cheia (sem barra do Chrome)?
  - Barra status (topo) exibe tema verde?
  - Não deve haver botão voltar do navegador ou barra de navegação
  
- [ ] **Teste de Funcionalidade**
  - [ ] Login funciona (use amandaperruchegarcia@gmail.com)
  - [ ] Consegue navegar entre telas/menu
  - [ ] CRUD funciona (criar tarefa, editar, deletar)
  - [ ] Logout funciona e volta para tela de login

### Resultado Android
- [ ] PASSOU
- [ ] FALHOU (descreva o problema abaixo)

**Problema encontrado (se falhou):**
```
[descrever aqui]
```

---

## 3. Verificações Gerais (iOS e Android)

Além das validações específicas acima, confira:

- [ ] **Ícone Visual**
  - [ ] Logo aparece como verde (#2d7a4a), não genérica
  - [ ] Tamanho e proporção estão corretos
  - [ ] Nome "Alprox" é exibido abaixo/ao lado do ícone

- [ ] **Comportamento como App**
  - [ ] Abre sem barra de navegador (modo standalone)
  - [ ] Não mostra botão back/forward do navegador
  - [ ] Barra status/header do SO mostra tema verde
  - [ ] Orientação se ajusta corretamente ao girar o device

- [ ] **Funcionalidade Principal**
  - [ ] Login funciona com credenciais válidas
  - [ ] Menu de navegação está acessível
  - [ ] Todas as telas carregam corretamente
  - [ ] Criar nova tarefa funciona
  - [ ] Editar tarefa existente funciona
  - [ ] Deletar tarefa funciona
  - [ ] Logout retorna para tela de login

- [ ] **Modo Offline (opcional, se implementado)**
  - [ ] App segue funcionando em abas instaladas
  - [ ] Dados anteriores estão visíveis
  - [ ] Ações offline são sincronizadas após reconectar

---

## 4. Troubleshooting

### Problema: Botão de instalação não aparece

**Causa:** PWA não está sendo reconhecida pelo navegador

**Soluções:**
1. Atualizar a página (Pull-to-refresh no celular, Ctrl+R no desktop)
2. Tentar em aba anônima/privada
   - iOS: Safari → Menu → "Private" ativado
   - Android: Chrome → Menu → "New Incognito tab"
3. Verificar barra de endereço
   - Deve haver cadeado 🔒 indicando HTTPS
   - URL deve ser exata: https://alprox-processos.vercel.app
4. Aguardar 10-15 segundos na página inicial
   - O Chrome precisa de tempo para reconhecer o manifest.json
5. Tentar novamente após alguns segundos
6. Se continuar não aparecendo, verifique:
   - Se manifest.json está correto em `public/manifest.json`
   - Se meta tags estão presentes no `<head>` do HTML
   - Se o app está acessível via HTTPS

---

### Problema: App aparece vazio após instalar

**Causa:** Cache do navegador ou do app, ou falha no carregamento de recursos

**Soluções:**

**iOS:**
1. Deslizar para a esquerda no ícone do app → "Remover"
2. Reinstalar seguindo os passos da seção iOS acima
3. Se persistir: Settings → Safari → Clear History and Website Data → Clear All
4. Tentar instalar novamente

**Android:**
1. Abrir Settings (Configurações)
2. Ir para Applications (Aplicativos) → Alprox
3. Clicar "Storage" (Armazenamento)
4. Clique "Clear Cache" (Limpar Cache)
5. Voltar e abrir o app
6. Se continuar vazio:
   - Desinstalar o app (clique longo no ícone → Desinstalar)
   - Seguir os passos de instalação novamente

**Ambos os sistemas:**
1. Hard refresh: Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)
2. Se acessar pelo Chrome no desktop primeiro, fazer hard refresh lá também

---

### Problema: Login não funciona

**Causa:** Problema de conectividade, credenciais inválidas, ou sessão expirada

**Soluções:**
1. Verificar conexão de internet
   - Abrir outro site (e.g., google.com) para confirmar conectividade
   - Desativar WiFi e usar dados móveis (ou vice-versa)
   - Se em WiFi, tentar reconectar à rede
   
2. Usar credenciais corretas
   - Email: `amandaperruchegarcia@gmail.com`
   - Senha: [confira no seu gerenciador de senhas ou email de reset]
   - Certifique-se de que não há espaços no início/fim
   
3. Logout e login novamente
   - Abrir menu (se possível) → Logout
   - Esperar 2-3 segundos
   - Fazer login novamente com as credenciais
   
4. Limpar dados do app (veja Problema anterior)

5. Se o problema persistir:
   - Fazer screenshot da tela de erro
   - Verificar console do navegador para mensagens de erro
     - Android Chrome: Menu → More Tools → Developer Tools → Console
     - iPhone Safari: Settings → Advanced → Web Inspector → Ativa
   - Compartilhar screenshot e mensagens de erro

---

### Problema: App não funciona offline

**Nota:** O app não precisa funcionar offline, mas se tiver Service Worker implementado, ele deve:

**Soluções:**
1. Ativar modo avião no dispositivo (simula offline)
2. Abrir o app instalado
3. Se implementado corretamente, deve continuar mostrando dados do último acesso
4. Desativar modo avião
5. Abrir o app novamente - deve sincronizar com servidor

---

### Problema: Ícone não aparece na tela inicial / drawer

**Causa:** Falha na instalação, ou não foi concluída

**Soluções:**
1. Desinstalar o app (remover da tela inicial ou drawer)
2. Fazer hard refresh da página no navegador
3. Aguardar 15-20 segundos com a página aberta
4. Tentar instalar novamente usando os passos da seção apropriada

---

## 5. Como Relatar Problemas

Se encontrar algum problema durante os testes:

1. **Anote:**
   - Sistema: iOS / Android
   - Navegador e versão
   - Versão do SO (e.g., iOS 17.5, Android 14)
   - Dispositivo exato (e.g., iPhone 12, Samsung Galaxy S21)
   - Passo exato onde falhou
   - Mensagem de erro (se houver)
   - Screenshot da tela

2. **Exemplo de relatório:**
   ```
   Sistema: Android
   Dispositivo: Samsung Galaxy A51
   SO: Android 12
   Navegador: Chrome 125.0.6422.167
   
   Problema: Login não funciona
   
   Passos para reproduzir:
   1. Abrir app instalado
   2. Digitar amandaperruchegarcia@gmail.com
   3. Digitar senha
   4. Clicar "Entrar"
   
   Resultado: Tela fica em branco por 10 segundos, depois volta para login
   
   Screenshot: [anexar]
   ```

3. **Onde reportar:**
   - Abrir issue no GitHub do projeto
   - Ou enviar email com detalhes completos

---

## 6. Resumo Rápido

| Item | iOS | Android | Status |
|------|-----|---------|--------|
| Botão instalar aparece | ✓ | ✓ | [ ] |
| App instala com sucesso | ✓ | ✓ | [ ] |
| Ícone verde aparece | ✓ | ✓ | [ ] |
| Nome "Alprox" correto | ✓ | ✓ | [ ] |
| Abre em tela cheia | ✓ | ✓ | [ ] |
| Login funciona | ✓ | ✓ | [ ] |
| Navegação funciona | ✓ | ✓ | [ ] |
| CRUD funciona | ✓ | ✓ | [ ] |
| Logout funciona | ✓ | ✓ | [ ] |

---

## 7. Próximos Passos

Após completar os testes:

1. **Se tudo passou:**
   - Parabenize-se! O app está pronto como PWA
   - Compartilhe a URL com usuários
   - Instrua-os a instalar usando este guia

2. **Se algo falhou:**
   - Anote qual foi o problema (seção 4)
   - Verifique a checklist de troubleshooting
   - Se não conseguir resolver, abra uma issue com detalhes

3. **Manutenção:**
   - Periodicamente testar em dispositivos diferentes
   - Verificar se manifest.json está atualizado
   - Manter iOS e Android atualizados para testes futuros

---

**Última atualização:** 03 de agosto de 2026

**Versão do app testada:** [preenchido após deploy]

**Resultado geral:** [ ] PASSOU | [ ] FALHOU | [ ] PARCIALMENTE
