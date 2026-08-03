# 📱 Alprox Processos — Plano do MVP
> App para documentar e organizar os processos e instruções de trabalho do escritório de contabilidade ALPROX, pra você parar de repetir explicação toda semana e a equipe consultar sozinha.

## 1. Decisões

| Tema | Decisão |
|---|---|
| Quem usa | Você e a equipe do escritório ALPROX |
| Precisa de login? | Sim — cada colaborador com acesso próprio (entra na fase final) |
| Dispositivo principal | Computador no dia a dia, mas o app é mobile-first (funciona bem nos dois) |
| Dados | Começa salvando no navegador (local); Supabase + login entram só na fase final |
| Identidade visual | Verde (cor do logo ALPROX) + cinza-claro + branco + dourado/âmbar de destaque para alertas; fonte Inter ou Poppins |
| Referência de layout | Clean e minimalista, inspirado no próprio logo da ALPROX |

## 2. Telas do app

| Tela | O que a pessoa faz nela |
|---|---|
| **Dashboard** (tela inicial) | Visão geral: cards com números-chave de cada módulo (clicáveis, levam direto pra tela) e um calendário do mês com prazos, validades e tarefas — clicar num dia mostra os itens e leva direto pra tela certa |
| **Processos** (core) | Consulta instruções de trabalho organizadas por departamento, cada uma com link do Drive e/ou vídeo do YouTube |
| **Minhas tarefas** | Checklist de tarefas pessoais e profissionais |
| **Tarefas da equipe** | Atribui e acompanha tarefas dos colaboradores |
| **Prazos** | Visão geral de prazos e vencimentos gerais |
| **Certidões negativas** | Cadastro e controle de validade das certidões |
| **Certificados digitais** | Cadastro e controle de validade dos certificados digitais |
| **Clientes** | Cadastro das empresas clientes, dados, histórico do dia a dia e observações |
| **Fluxos** | Fluxograma de verdade (Início, passos de ação, decisões em losango com ramos Sim/Não, Fim) pra tarefas específicas — cada passo pode apontar pro processo certo em caso de dúvida |
| **Login** (fase final) | Cada colaborador acessa com sua própria conta |

## 3. O diferencial (detalhado)

A tela de **Processos** é o coração do app. Ela organiza as instruções de trabalho do escritório do mesmo jeito que a planilha "LISTA DE PROCEDIMENTOS" já organiza hoje, só que dentro do app e fácil de consultar:

- Cada processo tem: **nome**, **departamento** (Administrativo, Contábil, Societário, Departamento Pessoal, Fiscal, Processos, Treinamento), **código** (ex: IT-001-ADM), **link do Drive** (onde está o documento escrito), **link do YouTube** (se houver vídeo explicando), **status** (ativo/inativo) e **observações**.
- A pessoa entra na tela, filtra ou busca por departamento, encontra o processo pelo nome e clica pra abrir o link (Drive ou vídeo) — sem precisar te perguntar ou procurar em pastas espalhadas.
- Você (ou quem tiver permissão) consegue cadastrar, editar e desativar processos conforme os procedimentos mudam.

## 4. O que o app guarda

```
Processo: nome, departamento, código, link do Drive, link do YouTube (opcional), status (ativo/inativo), observações

Tarefa: título, responsável (colaborador), prazo, status (a fazer/fazendo/feito), descrição
(a mesma estrutura serve pra "Minhas tarefas" e "Tarefas da equipe" — muda só quem é o responsável)

Prazo: título, cliente (opcional), data de vencimento, responsável, status (pendente/cumprido)

Certidão negativa: cliente, tipo de certidão, data de emissão, data de validade, status (válida/vencida)

Certificado digital: cliente, tipo (e-CNPJ/e-CPF), data de emissão, data de validade, responsável, status

Cliente: nome da empresa, CNPJ, contato, responsável, observações, histórico (lista de anotações por data)

Colaborador: nome, e-mail (login), cargo/função

Fluxo: nome (ex: "Fechamento mensal"), um fluxograma de passos conectados a partir do Início
Passo do tipo Ação: texto (o que fazer), processo relacionado (opcional — pra consultar em caso de dúvida), aponta pro próximo passo (ou Fim)
Passo do tipo Decisão: texto (a pergunta), aponta pra um próximo passo no ramo "Sim" e outro no ramo "Não" (cada ramo pode terminar em Fim de forma independente)
```

Cada tarefa, prazo, certidão e certificado pode estar ligado a um **cliente** e a um **colaborador** responsável.

O Dashboard não guarda nada de novo — ele só lê e resume o que já está nas outras telas.

## 5. Fases de construção

| Fase | O que entrega | Quando (workshop) | Status |
|---|---|---|---|
| **0. Setup + preview duplo** | Projeto rodando no navegador, mobile-first, com a cara da ALPROX (paleta verde + fonte) e tela de preview mostrando o app no celular e no computador ao mesmo tempo | Aula 2 | ✅ |
| **1. Processos** (core) | Cadastro e consulta de processos por departamento, com link do Drive/YouTube, salvando local | Aula 2 | ✅ |
| **2. Minhas tarefas** | Checklist de tarefas pessoais e profissionais | Aula 2 / dever de casa | ✅ |
| **3. Tarefas da equipe** | Atribuição e acompanhamento de tarefas dos colaboradores | Dever de casa | ✅ |
| **4. Prazos** | Cadastro e visão geral de prazos e vencimentos | Dever de casa | ✅ |
| **5. Certidões negativas** | Cadastro e controle de validade das certidões | Dever de casa | ✅ |
| **6. Certificados digitais** | Cadastro e controle de validade dos certificados | Dever de casa | ✅ |
| **7. Clientes** | Cadastro de clientes com histórico e observações | Dever de casa | ✅ |
| **8. Fluxos** | Fluxograma com ramificação (Início, ação, decisão sim/não, Fim), com link direto pro processo relacionado | Dever de casa | ✅ |
| **9. Dashboard** | Tela inicial com cards-resumo de todos os módulos e um calendário com prazos, validades e tarefas | Dever de casa | ✅ |
| **Final. Publicar** | Supabase (dados de verdade + login de cada colaborador) + deploy na Vercel + instalar como PWA no celular | Aula 3 | ⬜ |

## 6. Versão 2 (fica pra depois)

- **Controle financeiro do escritório** (contas a pagar/receber, lançamentos) — módulo à parte, bem diferente dos demais, fica pra depois do MVP
- Notificações de prazos vencendo
- Integrações externas (ex: sistemas de terceiros, WhatsApp)
