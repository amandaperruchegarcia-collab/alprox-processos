# Checklist de Testes Pós-Deploy — Alprox Processos

**URL de Produção:** https://alprox-processos.vercel.app (ou sua URL customizada)

**Data de Deploy:** [preencher com a data]

**Testador:** [preencher com seu nome]

Este documento contém um checklist completo para validar que o app funciona corretamente após o deploy na Vercel. Execute os testes nesta ordem e marque ✅ conforme avança.

---

## Checklist de Testes

### 1. Testes de Carregamento Inicial

- [ ] **Página carrega sem erros**
  - [ ] Abrir https://alprox-processos.vercel.app no navegador
  - [ ] Verificar Console (F12 > Console) — não deve ter erros vermelhos críticos
  - [ ] Página deve exibir a tela de login

- [ ] **Logo e branding aparecem corretos**
  - [ ] Logo ALPROX visível na tela de login
  - [ ] Cores da marca aparecem (verde ALPROX)
  - [ ] Layout responsivo (redimensionar janela — layout não quebra)

- [ ] **Performance inicial aceitável**
  - [ ] Página carrega em menos de 3 segundos (F12 > Network)
  - [ ] Nenhum asset bloqueado ou falhando (todos os status 200)

---

### 2. Testes de Autenticação

#### 2.1 Login com Credenciais Inválidas

- [ ] **Email inválido ou não registrado**
  - [ ] Digitar email que não existe: `naoexiste@test.com`
  - [ ] Preencher senha qualquer
  - [ ] Clicar "Entrar"
  - [ ] ✅ Esperado: Mensagem de erro aparece ("Invalid login credentials" ou similar)
  - [ ] ✅ Usuário continua na tela de login

- [ ] **Senha incorreta**
  - [ ] Digitar email correto: `amandaperruchegarcia@gmail.com`
  - [ ] Digitar senha errada: `senhaerrada123`
  - [ ] Clicar "Entrar"
  - [ ] ✅ Esperado: Mensagem de erro aparece
  - [ ] ✅ Usuário continua na tela de login

- [ ] **Campos vazios**
  - [ ] Deixar email vazio, preencher senha, clicar "Entrar"
  - [ ] ✅ Esperado: Validação do cliente bloqueia ("Por favor, preencha email e senha")
  - [ ] Deixar senha vazia, preencher email, clicar "Entrar"
  - [ ] ✅ Esperado: Validação do cliente bloqueia

#### 2.2 Login com Credenciais Corretas

- [ ] **Login bem-sucedido (primeira vez)**
  - [ ] Digitar email: `amandaperruchegarcia@gmail.com`
  - [ ] Digitar senha: [sua senha Supabase]
  - [ ] Clicar "Entrar"
  - [ ] ✅ Esperado: Redirecionamento para Dashboard
  - [ ] ✅ Console mostra: "✅ Login bem-sucedido para: amandaperruchegarcia@gmail.com"
  - [ ] ✅ Console mostra: "🔄 Iniciando migração de dados localStorage → Supabase..." (apenas na primeira vez)
  - [ ] ✅ Console mostra: "✅ Migração concluída com sucesso!" (apenas na primeira vez)

- [ ] **Dashboard carrega com dados**
  - [ ] Menu lateral apareça com abas: Dashboard, Processos, Minhas Tarefas, Tarefas Equipe, etc.
  - [ ] Saudação personalizada mostra: "Olá, [seu_email]"
  - [ ] Botão "Sair" visível no menu

- [ ] **Login bem-sucedido (segunda vez em diante)**
  - [ ] Fazer logout
  - [ ] Fazer login novamente com mesmas credenciais
  - [ ] ✅ Esperado: Redirecionamento rápido para Dashboard
  - [ ] ✅ NÃO mostra migração (flag `_migrado_supabase` já está em localStorage)

#### 2.3 Session Persistence

- [ ] **Sessão persiste ao recarregar a página**
  - [ ] Estar logado no Dashboard
  - [ ] Pressionar F5 (recarregar página)
  - [ ] ✅ Esperado: Página recarrega e mantém login (Dashboard permanece visível)
  - [ ] ✅ Não volta para tela de login

- [ ] **Sessão funciona em nova aba**
  - [ ] Estar logado em uma aba
  - [ ] Abrir nova aba e ir para https://alprox-processos.vercel.app
  - [ ] ✅ Esperado: Nova aba já carrega logado no Dashboard
  - [ ] ✅ Não precisa fazer login novamente

#### 2.4 Logout

- [ ] **Botão "Sair" funciona**
  - [ ] Estar no Dashboard
  - [ ] Clicar em "Sair" (ou ícone de logout no menu)
  - [ ] ✅ Esperado: Redirecionamento para tela de login
  - [ ] ✅ Console mostra: "✅ Logout realizado com sucesso"
  - [ ] ✅ Recarregar página (F5) — volta para tela de login (sessão limpou)

---

### 3. Testes de Dados e Supabase

#### 3.1 Dados Compartilhados (após login)

- [ ] **Processos carregam**
  - [ ] Clicar em "Processos" no menu
  - [ ] ✅ Esperado: Tabela com processos aparece
  - [ ] ✅ Se houver dados migrados, eles devem aparecer na lista
  - [ ] ✅ Se vazio, tabela vazia é aceitável (dados serão adicionados depois)

- [ ] **Clientes carregam**
  - [ ] Clicar em "Clientes" no menu
  - [ ] ✅ Esperado: Tabela com clientes aparece
  - [ ] ✅ Dados aparecem ou tabela está vazia (esperado em primeira execução)

- [ ] **Fluxos carregam**
  - [ ] Clicar em "Fluxos" no menu
  - [ ] ✅ Esperado: Tabela com fluxos aparece
  - [ ] ✅ Dados aparecem ou tabela está vazia

- [ ] **Verificar que dados compartilhados são de READ-ONLY (para usuário normal)**
  - [ ] Processos/Clientes/Fluxos devem exibir dados mas botões de edição/delete podem estar desabilitados
  - [ ] ✅ Se aparecer erro no console sobre RLS ao tentar editar, é esperado

#### 3.2 Dados Pessoais (após login)

- [ ] **Minhas Tarefas carregam**
  - [ ] Clicar em "Minhas Tarefas" no menu
  - [ ] ✅ Esperado: Tabela com suas tarefas pessoais aparece
  - [ ] ✅ Inicialmente vazia (dados pessoais isolados por usuario_id)

- [ ] **Tarefas Equipe carregam**
  - [ ] Clicar em "Tarefas Equipe" no menu
  - [ ] ✅ Esperado: Tabela com tarefas da equipe aparece

- [ ] **Prazos carregam**
  - [ ] Clicar em "Prazos" no menu
  - [ ] ✅ Esperado: Tabela com prazos aparece
  - [ ] ✅ Se houver prazos vencidos, devem estar destacados (cor dourada/laranja)

- [ ] **Certidões carregam**
  - [ ] Clicar em "Certidões" no menu
  - [ ] ✅ Esperado: Tabela com certidões aparece

- [ ] **Certificados carregam**
  - [ ] Clicar em "Certificados" no menu
  - [ ] ✅ Esperado: Tabela com certificados aparece

#### 3.3 Dashboard

- [ ] **Dashboard principal mostra cards com resumos**
  - [ ] Clicar em "Dashboard" no menu
  - [ ] ✅ Esperado: Cards com contagens aparecem (ex: "3 Processos", "5 Tarefas", etc)
  - [ ] ✅ Calendário com eventos aparece (se houver integração)

- [ ] **Calendário é interativo**
  - [ ] Ver calendário no Dashboard
  - [ ] ✅ Clicar em um evento do calendário (se houver)
  - [ ] ✅ Esperado: Navega para tela relacionada (ex: clica evento de tarefa → vai pra "Minhas Tarefas")

---

### 4. Testes de Navegação

#### 4.1 Menu Lateral

- [ ] **Menu responde a cliques**
  - [ ] Abas do menu: Dashboard, Processos, Minhas Tarefas, Tarefas Equipe, Prazos, Certidões, Certificados, Clientes, Fluxos
  - [ ] ✅ Cada clique navega para a tela correspodente
  - [ ] ✅ Aba ativa fica destacada

- [ ] **Menu collapsa em mobile (se aplicável)**
  - [ ] Redimensionar para 375px de largura (tamanho de celular)
  - [ ] ✅ Menu fica em hamburger (≡)
  - [ ] ✅ Clicar no ≡ abre/fecha menu

#### 4.2 Navegação Entre Telas

- [ ] **Navegar Dashboard → Processos → Minhas Tarefas → Dashboard**
  - [ ] Clique em cada aba do menu
  - [ ] ✅ Telas trocam corretamente
  - [ ] ✅ Dados persistem (se sair e voltar pra mesma tela, dados não resetam)

- [ ] **Browser back/forward buttons funcionam**
  - [ ] Navegar entre telas usando menu
  - [ ] Clicar botão "Voltar" do navegador
  - [ ] ✅ Esperado: Volta pra tela anterior (browser history funciona)
  - [ ] Clicar "Avançar"
  - [ ] ✅ Esperado: Avança pra próxima tela

---

### 5. Testes de Funcionalidade (CRUD)

#### 5.1 Criar Tarefa

- [ ] **Criar nova tarefa em "Minhas Tarefas"**
  - [ ] Ir para "Minhas Tarefas"
  - [ ] Clicar em "Adicionar Tarefa" ou botão similar
  - [ ] Preencher formulário:
    - [ ] Título: "Teste de Tarefa Post-Deploy"
    - [ ] Descrição: "Tarefa criada durante testes"
    - [ ] Prazo: [data futura, ex: 2026-09-01]
    - [ ] Prioridade: Alta (ou valor padrão)
  - [ ] Clicar "Salvar" ou "Adicionar"
  - [ ] ✅ Esperado: Mensagem de sucesso aparece
  - [ ] ✅ Tarefa aparece na lista de "Minhas Tarefas"
  - [ ] ✅ Console mostra confirmação de insert no Supabase

- [ ] **Verificar que tarefa foi salva no Supabase**
  - [ ] Recarregar página (F5)
  - [ ] Ir para "Minhas Tarefas"
  - [ ] ✅ Esperado: Tarefa criada ainda aparece (dados persistiram no banco)

#### 5.2 Editar Tarefa

- [ ] **Editar tarefa criada**
  - [ ] Encontrar a tarefa criada em "Minhas Tarefas"
  - [ ] Clicar em "Editar" ou no botão de edição
  - [ ] Mudar título: "Teste de Tarefa Post-Deploy - EDITADO"
  - [ ] Clicar "Salvar"
  - [ ] ✅ Esperado: Mensagem de sucesso aparece
  - [ ] ✅ Título atualizado na lista
  - [ ] ✅ Console mostra confirmação de update

- [ ] **Verificar que edição foi salva no Supabase**
  - [ ] Recarregar página (F5)
  - [ ] Ir para "Minhas Tarefas"
  - [ ] ✅ Esperado: Título editado permanece (update persistiu)

#### 5.3 Deletar Tarefa

- [ ] **Deletar tarefa criada**
  - [ ] Encontrar a tarefa "Teste de Tarefa Post-Deploy - EDITADO"
  - [ ] Clicar em "Deletar" ou ícone de lixo
  - [ ] ✅ Esperado: Confirmação aparece ("Tem certeza?")
  - [ ] Confirmar delete
  - [ ] ✅ Esperado: Tarefa desaparece da lista
  - [ ] ✅ Console mostra confirmação de delete

- [ ] **Verificar que delete foi persistido no Supabase**
  - [ ] Recarregar página (F5)
  - [ ] Ir para "Minhas Tarefas"
  - [ ] ✅ Esperado: Tarefa deletada não aparece mais (delete persistiu)

---

### 6. Testes de Prazos e Datas

#### 6.1 Prazos Vencidos

- [ ] **Criar tarefa com prazo vencido**
  - [ ] Ir para "Minhas Tarefas"
  - [ ] Criar nova tarefa com prazo no passado (ex: 2025-01-01)
  - [ ] ✅ Esperado: Tarefa aparece com destaque (cor dourada/laranja/vermelho)

- [ ] **Prazos na aba "Prazos"**
  - [ ] Ir para "Prazos"
  - [ ] ✅ Esperado: Tarefas com prazos vencidos aparecem destacadas
  - [ ] ✅ Ordem: prazos vencidos primeiro, depois próximos vencimentos

#### 6.2 Calendário (se implementado)

- [ ] **Calendário mostra eventos**
  - [ ] No Dashboard, verificar calendário
  - [ ] ✅ Esperado: Eventos das tarefas aparecem no calendário
  - [ ] Clicar em um evento
  - [ ] ✅ Esperado: Navega para tela relativa (ex: "Minhas Tarefas" com filtro da data)

---

### 7. Testes de Performance

#### 7.1 Tempo de Carregamento

- [ ] **Página inicial carrega rápido**
  - [ ] Abrir DevTools (F12 > Network)
  - [ ] Limpar cache: F12 > Network > Disable cache + Ctrl+Shift+R (hard refresh)
  - [ ] Recarregar https://alprox-processos.vercel.app
  - [ ] ✅ Esperado: Tela de login aparece em < 3 segundos
  - [ ] ✅ Verificar tempo total em "Finish" (Network tab)

- [ ] **Dashboard carrega rápido**
  - [ ] Após login, verificar Network tab
  - [ ] ✅ Esperado: Dashboard aparece em < 2 segundos
  - [ ] ✅ Queries Supabase completam sem delays longos

#### 7.2 Interatividade

- [ ] **Cliques respondem rapidamente**
  - [ ] Clicar em botões do menu
  - [ ] ✅ Esperado: Telas trocam sem delay perceptível (< 500ms)
  - [ ] Criar/editar/deletar tarefas
  - [ ] ✅ Esperado: Ações completam rapidamente

#### 7.3 Migração (primeira vez)

- [ ] **Migração de dados completa sem travamentos**
  - [ ] Criar novo usuário Supabase (opcional, apenas se quiser testar migração)
  - [ ] OU: Limpar localStorage e fazer login novamente
  - [ ] ✅ Esperado: Migração completa (console mostra todos os passos)
  - [ ] ✅ Sem travamentos ou timeouts

---

### 8. Testes de Mobile e PWA

#### 8.1 Responsividade Mobile

- [ ] **Abrir em iPhone (Safari) ou Android (Chrome)**
  - [ ] URL: https://alprox-processos.vercel.app
  - [ ] ✅ Tela de login aparece responsiva (sem scroll horizontal)
  - [ ] ✅ Botões são clicáveis (com espaço suficiente)
  - [ ] ✅ Texto legível (sem zoom necessário)

- [ ] **Fazer login no celular**
  - [ ] Digitar email e senha no celular
  - [ ] ✅ Teclado virtual aparece e desaparece corretamente
  - [ ] ✅ Após login, Dashboard carrega

- [ ] **Menu responsivo em mobile**
  - [ ] Verificar se menu está em hamburger (≡) em celular
  - [ ] ✅ Clicar ≡ abre/fecha menu
  - [ ] ✅ Clicar aba navegaçãofunciona

#### 8.2 PWA (Progressive Web App)

- [ ] **Botão "Instalar App" aparece (Chrome/Android)**
  - [ ] Abrir https://alprox-processos.vercel.app em Chrome (celular)
  - [ ] ✅ Esperado: Banner "Instalar app" aparece em cima da tela
  - [ ] OU: Menu > Instalar app
  - [ ] Clicar "Instalar"
  - [ ] ✅ Esperado: App fica instalado (ícone na home do celular)

- [ ] **Abrir app instalado**
  - [ ] Clicar no ícone do app na home
  - [ ] ✅ Esperado: App abre em modo "app" (sem barra de endereço do navegador)
  - [ ] ✅ Logo ALPROX visível
  - [ ] ✅ Funcionalidade completa (login, dados, navegação)

- [ ] **PWA offline (opcional, teste avançado)**
  - [ ] App instalado aberto
  - [ ] Ativar modo offline (DevTools ou desligar Wi-Fi)
  - [ ] ✅ Esperado: App não falha, mostra dados em cache (se houver)

---

### 9. Testes de Segurança

#### 9.1 HTTPS e Certificado

- [ ] **URL usa HTTPS**
  - [ ] Abrir https://alprox-processos.vercel.app
  - [ ] ✅ Cadeado 🔒 aparece na barra de endereço (protocolo HTTPS)
  - [ ] Clicar no 🔒
  - [ ] ✅ Certificado válido aparece (emitido por Let's Encrypt ou similar)

#### 9.2 Credenciais Supabase (Segurança)

- [ ] **Chave Supabase é pública (esperado)**
  - [ ] Abrir DevTools (F12 > Console)
  - [ ] Digitar: `SUPABASE_KEY`
  - [ ] ✅ Esperado: Chave "sb_publishable_..." aparece (é a chave pública anon, seguro)
  - [ ] ✅ Isso é aceitável — a chave anon só acessa dados com RLS habilitado

#### 9.3 RLS (Row Level Security)

- [ ] **RLS bloqueia acesso indevido**
  - [ ] Abrir DevTools (F12 > Console)
  - [ ] Tentar query direta Supabase (simulando usuário malicioso):
  ```javascript
  // Copiar em console e colar:
  const { data, error } = await supabase
    .from('minhas_tarefas')
    .select('*')
    .eq('usuario_id', 'outro_usuario_id');
  console.log('Dados:', data);
  console.log('Erro:', error);
  ```
  - [ ] ✅ Esperado: `error` contém "RLS policy" ou dados vazio
  - [ ] ✅ NÃO consegue acessar dados de outro usuário

#### 9.4 Validação no Cliente

- [ ] **Formulários validam antes de enviar**
  - [ ] Tentar enviar formulário vazio (ex: criar tarefa sem título)
  - [ ] ✅ Esperado: Validação bloqueia (mensagem de erro no cliente)
  - [ ] NÃO envia request vazio ao servidor

---

### 10. Testes de Integração com Supabase

#### 10.1 Conexão Supabase

- [ ] **Supabase conecta sem CORS errors**
  - [ ] DevTools (F12 > Network)
  - [ ] Fazer qualquer ação (login, criar tarefa)
  - [ ] ✅ Requests para `aefiardlggehjlnrjavz.supabase.co` aparecem
  - [ ] ✅ Status: 200 (sucesso), nunca 401 ou 403 por CORS

#### 10.2 Autenticação Supabase

- [ ] **Tokens JWT funcionam**
  - [ ] Estar logado
  - [ ] DevTools (F12 > Application > Cookies)
  - [ ] ✅ Encontrar cookie `sb-...` (session token)
  - [ ] Fazer qualquer request Supabase (ex: carregar processos)
  - [ ] ✅ Request inclui token em header `Authorization: Bearer ...`

#### 10.3 Database Queries

- [ ] **Queries SELECT funcionam**
  - [ ] Qualquer tela com listagem (Processos, Tarefas, etc)
  - [ ] DevTools (F12 > Network > Filter: xhr)
  - [ ] ✅ Requests POST a `/rest/v1/...` aparecem
  - [ ] ✅ Status: 200, resposta JSON com dados

- [ ] **Queries INSERT/UPDATE/DELETE funcionam**
  - [ ] Criar uma tarefa
  - [ ] DevTools (F12 > Network)
  - [ ] ✅ Request POST/PATCH aparece
  - [ ] ✅ Status: 200, response contém registro criado/atualizado
  - [ ] Deletar tarefa
  - [ ] ✅ Request DELETE aparece
  - [ ] ✅ Status: 200/204 (sem erro)

---

### 11. Testes de Compatibilidade de Navegadores

#### 11.1 Chrome/Chromium

- [ ] **Chrome desktop (versão recente)**
  - [ ] Abrir https://alprox-processos.vercel.app em Chrome
  - [ ] ✅ Tudo funciona conforme esperado
  - [ ] ✅ DevTools acessível (F12)

#### 11.2 Firefox

- [ ] **Firefox desktop**
  - [ ] Abrir https://alprox-processos.vercel.app em Firefox
  - [ ] ✅ Tudo funciona conforme esperado
  - [ ] ✅ Dev Tools acessível (F12)

#### 11.3 Safari (macOS)

- [ ] **Safari macOS**
  - [ ] Abrir https://alprox-processos.vercel.app em Safari
  - [ ] ✅ Tudo funciona conforme esperado
  - [ ] ✅ Web Inspector acessível (Cmd+Option+I)

#### 11.4 Safari (iOS)

- [ ] **Safari iPhone**
  - [ ] Abrir https://alprox-processos.vercel.app em iPhone Safari
  - [ ] ✅ Funcionalidade completa
  - [ ] ✅ PWA installable aparece

---

### 12. Testes de Casos Extremos

#### 12.1 Sem Conexão Internet

- [ ] **Comportamento offline gracioso**
  - [ ] Estar logado
  - [ ] Desligar Wi-Fi/mobile data
  - [ ] Tentar fazer ação (ex: criar tarefa)
  - [ ] ✅ Esperado: Erro claro ("Sem conexão", "Erro de rede", etc)
  - [ ] ✅ NÃO fica congelado ou sem feedback

#### 12.2 Conexão Lenta

- [ ] **Ações respondem mesmo com internet lenta**
  - [ ] Simular conexão lenta: DevTools (F12 > Network > Throttling > Slow 3G)
  - [ ] Fazer ações (login, navegar, criar tarefa)
  - [ ] ✅ Esperado: Ações completam (pode ser mais lento, mas sem erro)
  - [ ] ✅ Loading indicators aparecem se aplicável

#### 12.3 Múltiplas Abas

- [ ] **Sincronização entre abas**
  - [ ] Abrir app em 2 abas (mesmo usuário)
  - [ ] Em aba 1: Criar nova tarefa
  - [ ] Voltar pra aba 2: Recarregar (F5)
  - [ ] ✅ Esperado: Tarefa criada em aba 1 aparece em aba 2

#### 12.4 Logout de Uma Aba

- [ ] **Logout não afeta outra aba automaticamente**
  - [ ] Abrir app em 2 abas
  - [ ] Em aba 1: Clicar "Sair"
  - [ ] Voltar pra aba 2
  - [ ] ✅ Esperado: Aba 2 ainda está logada (logout é local)
  - [ ] Recarregar aba 2 (F5)
  - [ ] ✅ Esperado: Volta para tela de login (sessão foi limpa)

---

## Resumo de Resultados

### Testes Executados

| Categoria | Status | Problemas Encontrados |
|-----------|--------|----------------------|
| Carregamento Inicial | [ ] PASS / [ ] FAIL | |
| Autenticação | [ ] PASS / [ ] FAIL | |
| Dados e Supabase | [ ] PASS / [ ] FAIL | |
| Navegação | [ ] PASS / [ ] FAIL | |
| Funcionalidade (CRUD) | [ ] PASS / [ ] FAIL | |
| Prazos e Datas | [ ] PASS / [ ] FAIL | |
| Performance | [ ] PASS / [ ] FAIL | |
| Mobile e PWA | [ ] PASS / [ ] FAIL | |
| Segurança | [ ] PASS / [ ] FAIL | |
| Integração Supabase | [ ] PASS / [ ] FAIL | |
| Compatibilidade | [ ] PASS / [ ] FAIL | |
| Casos Extremos | [ ] PASS / [ ] FAIL | |

### Notas e Observações

```
[Escrever aqui qualquer problema encontrado, comportamento inesperado, ou observação importante]
```

### Decisão Final

- [ ] **APROVADO** — Todos os testes passaram. App pronto para produção.
- [ ] **APROVADO COM RESSALVAS** — Alguns testes falharam, mas não são críticos. Veja seção "Problemas" acima.
- [ ] **REPROVADO** — Falhas críticas encontradas. NÃO publicar. Ver troubleshooting.

---

## Próximos Passos

Se todos os testes passaram ✅:
1. Anotar data e horário do deploy bem-sucedido
2. Compartilhar URL com stakeholders
3. Monitorar Vercel dashboard nos próximos dias (erros em produção)

Se encontrou problemas:
1. Consultar `TROUBLESHOOTING-POST-DEPLOY.md`
2. Se problema persistir, verificar logs Supabase
3. Se necessário, fazer rollback (redeploy versão anterior)

---

**Última atualização:** [preencherconsomadata]  
**Documentação versão:** 1.0
