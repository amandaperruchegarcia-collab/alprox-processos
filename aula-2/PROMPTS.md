# Prompts prontos — Alprox Processos

Cada prompt abaixo constrói UMA fase do `PLANO.md`. Se você fechar e voltar outro dia, copie o prompt da fase onde parou (ou peça "continue meu app da Fase X").

---

## Prompt — Fase 0: Setup + preview duplo

Leia o arquivo PLANO.md. Estou construindo o app Alprox Processos: um app para documentar e organizar os processos e instruções de trabalho do escritório de contabilidade ALPROX.

Agora vamos construir SÓ a Fase 0: o esqueleto do projeto.

Nesta fase:
- Cria o projeto (HTML/CSS/JS simples, mobile-first), rodando localmente com uma URL (localhost) que eu consiga abrir no navegador.
- Aplica a identidade visual da ALPROX: verde (cor do logo) como cor principal, cinza-claro para fundos/textos secundários, branco de fundo geral, dourado/âmbar como cor de destaque (alertas, prazos vencendo). Fonte Inter ou Poppins.
- Cria uma tela de preview (`preview.html`) que mostra o app DUAS VEZES lado a lado: à esquerda dentro de uma moldura de celular (~390px de largura, com cara de telefone), à direita em largura de computador. As duas telas devem ser `<iframe>` apontando para a URL do app rodando (o mesmo app real, clicável, funcionando nos dois tamanhos ao mesmo tempo) — não são cópias estáticas nem prints.
- Cria um menu/navegação inicial com as telas do app: Processos, Minhas tarefas, Tarefas da equipe, Prazos, Certidões negativas, Certificados digitais, Clientes (as telas ainda vazias, só a navegação).

Identidade visual: verde ALPROX + cinza-claro + branco + dourado de destaque, fonte Inter/Poppins, mobile-first.
Não faça ainda: nenhuma tela com conteúdo funcional (isso vem nas próximas fases), banco de dados, login.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] Abro o preview.html e vejo o app duas vezes ao mesmo tempo: numa moldura de celular e em tamanho de computador
- [ ] Consigo clicar e navegar entre as telas nos dois tamanhos
- [ ] A cor verde, a fonte e o visual clean da ALPROX aparecem no app
- [ ] O menu mostra todas as telas previstas no plano

---

## Prompt — Fase 1: Processos

Leia o arquivo PLANO.md. Estou construindo o app Alprox Processos: um app para documentar e organizar os processos e instruções de trabalho do escritório de contabilidade ALPROX.
Já concluí a Fase 0. Agora vamos construir SÓ a Fase 1: a tela de Processos (o coração do app).

Nesta fase:
- Tela "Processos" onde dá pra cadastrar um processo novo com: nome, departamento (Administrativo, Contábil, Societário, Departamento Pessoal, Fiscal, Processos, Treinamento), código, link do Drive, link do YouTube (opcional), status (ativo/inativo) e observações.
- Lista de processos cadastrados, com filtro/busca por departamento e por nome.
- Cada processo na lista mostra um botão/link pra abrir o Drive e, se tiver, o vídeo do YouTube.
- Editar e excluir (ou desativar) um processo já cadastrado.
- Tudo salvando no navegador (localStorage), continua lá mesmo se eu fechar e abrir de novo.

Identidade visual: verde ALPROX, cinza-claro, branco, dourado de destaque, fonte Inter/Poppins, mobile-first.
Não faça ainda: as outras telas (tarefas, prazos, certidões, certificados, clientes), banco de dados, login.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] Consigo cadastrar um processo novo com nome, departamento, código e links
- [ ] O processo aparece na lista, e eu consigo filtrar por departamento
- [ ] Clico no link e ele abre o Drive/YouTube certinho
- [ ] Consigo editar e desativar um processo
- [ ] Fecho e abro o navegador de novo e os processos continuam lá

---

## Prompt — Fase 2: Minhas tarefas

Leia o arquivo PLANO.md. Estou construindo o app Alprox Processos.
Já concluí as Fases 0 e 1. Agora vamos construir SÓ a Fase 2: a tela "Minhas tarefas".

Nesta fase:
- Tela "Minhas tarefas" com checklist de tarefas pessoais e profissionais: título, prazo, status (a fazer/fazendo/feito), descrição.
- Consigo adicionar, marcar como feita, editar e excluir uma tarefa.
- Consigo ver as tarefas separadas por status (a fazer / fazendo / feito).

Identidade visual: verde ALPROX, cinza-claro, branco, dourado de destaque, fonte Inter/Poppins, mobile-first.
Não faça ainda: tarefas da equipe, prazos gerais, certidões, certificados, clientes, banco de dados, login.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] Consigo adicionar uma tarefa nova com título e prazo
- [ ] Consigo marcar como feita e ela muda de status
- [ ] Consigo editar e excluir uma tarefa
- [ ] Fecho e abro de novo e as tarefas continuam lá

---

## Prompt — Fase 3: Tarefas da equipe

Leia o arquivo PLANO.md. Estou construindo o app Alprox Processos.
Já concluí as Fases 0, 1 e 2. Agora vamos construir SÓ a Fase 3: a tela "Tarefas da equipe".

Nesta fase:
- Cadastro simples de colaboradores: nome (e cargo, opcional) — só pra poder atribuir tarefas a eles por enquanto (login de verdade só na fase final).
- Tela "Tarefas da equipe" igual à de "Minhas tarefas", mas com um campo a mais: responsável (escolhido entre os colaboradores cadastrados).
- Consigo filtrar as tarefas da equipe por responsável.

Identidade visual: verde ALPROX, cinza-claro, branco, dourado de destaque, fonte Inter/Poppins, mobile-first.
Não faça ainda: prazos gerais, certidões, certificados, clientes, banco de dados, login de verdade.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] Consigo cadastrar um colaborador
- [ ] Consigo criar uma tarefa e atribuir a um colaborador
- [ ] Consigo filtrar as tarefas por responsável
- [ ] Consigo marcar como feita, editar e excluir

---

## Prompt — Fase 4: Prazos

Leia o arquivo PLANO.md. Estou construindo o app Alprox Processos.
Já concluí as Fases 0 a 3. Agora vamos construir SÓ a Fase 4: a tela "Prazos".

Nesta fase:
- Tela "Prazos" com cadastro de: título, cliente (texto livre por enquanto, cadastro de cliente de verdade vem na Fase 7), data de vencimento, responsável, status (pendente/cumprido).
- Lista de prazos ordenada por data de vencimento, com destaque (cor dourada) para os que estão vencendo em breve ou já venceram.
- Consigo marcar como cumprido, editar e excluir.

Identidade visual: verde ALPROX, cinza-claro, branco, dourado de destaque para prazos vencendo, fonte Inter/Poppins, mobile-first.
Não faça ainda: certidões, certificados, clientes, banco de dados, login.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] Consigo cadastrar um prazo com data de vencimento
- [ ] Prazos vencendo/vencidos aparecem destacados
- [ ] Consigo marcar como cumprido, editar e excluir
- [ ] Fecho e abro de novo e os prazos continuam lá

---

## Prompt — Fase 5: Certidões negativas

Leia o arquivo PLANO.md. Estou construindo o app Alprox Processos.
Já concluí as Fases 0 a 4. Agora vamos construir SÓ a Fase 5: a tela "Certidões negativas".

Nesta fase:
- Tela "Certidões negativas" com cadastro de: cliente (texto livre por enquanto), tipo de certidão, data de emissão, data de validade, status (válida/vencida — calculado automaticamente pela data de validade).
- Lista com destaque (cor dourada) para as certidões vencidas ou perto de vencer.
- Consigo editar e excluir.

Identidade visual: verde ALPROX, cinza-claro, branco, dourado de destaque, fonte Inter/Poppins, mobile-first.
Não faça ainda: certificados digitais, clientes, banco de dados, login.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] Consigo cadastrar uma certidão com data de validade
- [ ] O status válida/vencida é calculado automaticamente
- [ ] Certidões vencidas ou perto de vencer aparecem destacadas
- [ ] Consigo editar e excluir

---

## Prompt — Fase 6: Certificados digitais

Leia o arquivo PLANO.md. Estou construindo o app Alprox Processos.
Já concluí as Fases 0 a 5. Agora vamos construir SÓ a Fase 6: a tela "Certificados digitais".

Nesta fase:
- Tela "Certificados digitais" com cadastro de: cliente (texto livre por enquanto), tipo (e-CNPJ/e-CPF), data de emissão, data de validade, responsável, status (válido/vencido — calculado automaticamente).
- Lista com destaque (cor dourada) para os certificados vencidos ou perto de vencer.
- Consigo editar e excluir.

Identidade visual: verde ALPROX, cinza-claro, branco, dourado de destaque, fonte Inter/Poppins, mobile-first.
Não faça ainda: clientes, banco de dados, login.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] Consigo cadastrar um certificado com data de validade
- [ ] O status válido/vencido é calculado automaticamente
- [ ] Certificados vencidos ou perto de vencer aparecem destacados
- [ ] Consigo editar e excluir

---

## Prompt — Fase 7: Clientes

Leia o arquivo PLANO.md. Estou construindo o app Alprox Processos.
Já concluí as Fases 0 a 6. Agora vamos construir SÓ a Fase 7: a tela "Clientes".

Nesta fase:
- Tela "Clientes" com cadastro de: nome da empresa, CNPJ, contato, responsável, observações.
- Dentro de cada cliente, um histórico onde dá pra adicionar anotações datadas (o que aconteceu naquele dia).
- Nas telas de Prazos, Certidões negativas e Certificados digitais, troque o campo "cliente" (texto livre) por uma seleção dos clientes cadastrados aqui.
- Lista de clientes com busca por nome.

Identidade visual: verde ALPROX, cinza-claro, branco, dourado de destaque, fonte Inter/Poppins, mobile-first.
Não faça ainda: banco de dados de verdade, login (isso é a fase final).
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] Consigo cadastrar um cliente com nome, CNPJ e contato
- [ ] Consigo adicionar uma anotação datada no histórico do cliente
- [ ] Prazos, certidões e certificados agora escolhem o cliente da lista cadastrada
- [ ] Consigo buscar um cliente pelo nome

---

## Prompt — Fase 8: Fluxos

Leia o arquivo PLANO.md. Estou construindo o app Alprox Processos.
Já concluí as Fases 0 a 7. Agora vamos construir SÓ a Fase 8: a tela "Fluxos".

Contexto: no escritório, várias tarefas específicas (ex: "Fechamento mensal") têm um passo a passo próprio, às vezes com decisões no meio do caminho (ex: "valor é maior que X? se sim faça Y, se não faça Z"), e cada passo às vezes precisa consultar um Processo já cadastrado em caso de dúvida.

Nesta fase, construa um **fluxograma de verdade** (com os símbolos corretos de fluxograma), não uma lista simples:
- Tela "Fluxos" (separada de Processos) onde consigo cadastrar um fluxo com nome (ex: "Fechamento mensal").
- Cada fluxo começa num círculo/oval verde "Início" e tem um caminho de passos até terminar num "Fim" (oval cinza).
- Existem dois tipos de passo: **Ação** (retângulo, com um texto de "o que fazer" e, opcionalmente, um processo relacionado escolhido entre os processos já cadastrados — "consulte aqui se tiver dúvida") e **Decisão** (losango, com uma pergunta de sim/não).
- Uma Decisão tem DOIS caminhos que saem dela: "Sim" e "Não" — cada um leva a um próximo passo diferente (ou pode terminar em "Fim" direto), formando ramos separados que não precisam se encontrar de novo.
- Em qualquer ponto do fluxo onde ainda não tem próximo passo, aparece um botão "+ Adicionar passo" logo antes do "Fim", pra continuar o fluxograma.
- Consigo editar o texto (e o processo relacionado, se for Ação) de qualquer passo, e excluir um passo — excluir também apaga tudo que vem depois dele naquele caminho.
- Quando uma Ação tem processo relacionado, aparece um botão "Consultar: [nome do processo]" — ao clicar, o app troca pra tela de Processos e já busca por aquele processo.
- Lista de fluxos com busca por nome.

Identidade visual: verde ALPROX pro Início e pros retângulos, dourado pro losango de decisão, cinza pro Fim, fonte Inter/Poppins, mobile-first (os ramos Sim/Não empilham no celular e ficam lado a lado no computador).
Não faça ainda: banco de dados de verdade, login (isso é a fase final).
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] Consigo criar um fluxo novo com nome, que já nasce com Início → Adicionar passo → Fim
- [ ] Consigo adicionar um passo de Ação (retângulo) com processo relacionado opcional
- [ ] Consigo adicionar um passo de Decisão (losango) com pergunta sim/não
- [ ] Uma Decisão mostra dois ramos (Sim e Não) que sigo caminhos diferentes e independentes, cada um terminando no seu próprio "Fim"
- [ ] Consigo editar e excluir qualquer passo (excluir remove o que vem depois também)
- [ ] Clicar em "Consultar" me leva direto pro processo certo, já filtrado
- [ ] Fecho e abro de novo e os fluxos continuam lá, com a ramificação intacta

---

## Prompt — Fase 9: Dashboard

Leia o arquivo PLANO.md. Estou construindo o app Alprox Processos.
Já concluí as Fases 0 a 8. Agora vamos construir SÓ a Fase 9: a tela "Dashboard", que passa a ser a tela inicial do app (a primeira do menu).

Nesta fase:
- Reordene o menu pra ficar: Dashboard, Processos, Fluxos, Minhas tarefas, Equipe, Prazos, Certidões, Certificados, Clientes.
- Tela "Dashboard" com cards de resumo, um pra cada módulo: Processos ativos, Fluxos cadastrados, Minhas tarefas pendentes, Tarefas da equipe pendentes, Prazos vencidos, Certidões vencidas, Certificados vencidos, Clientes cadastrados. Cada card é clicável e leva direto pra tela daquele módulo.
- Abaixo dos cards, um calendário do mês (com botões pra ir pro mês anterior/seguinte) mostrando pontinhos coloridos nos dias que têm prazo, validade de certidão/certificado ou tarefa (minha ou da equipe) vencendo.
- Clicar num dia do calendário mostra embaixo a lista dos itens daquele dia, e clicar num item leva direto pra tela correspondente.
- O Dashboard não guarda nada de novo — só lê o que já está salvo nas outras telas.

Identidade visual: verde ALPROX, cinza-claro, branco, dourado de destaque, fonte Inter/Poppins, mobile-first.
Não faça ainda: banco de dados de verdade, login (isso é a fase final).
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] O app abre direto no Dashboard, com o menu na ordem certa
- [ ] Os cards mostram os números certos e clicar neles leva pra tela certa
- [ ] O calendário mostra os pontinhos nos dias certos e dá pra navegar entre meses
- [ ] Clicar num dia mostra os itens daquele dia, e clicar num item leva pra tela certa

---

## Prompt — Fase Final: Publicar

Estou construindo o app Alprox Processos e já concluí todas as fases do MVP (Processos, Fluxos, Minhas tarefas, Tarefas da equipe, Prazos, Certidões negativas, Certificados digitais, Clientes e Dashboard), tudo salvando local no navegador.

Agora preciso: (1) trocar os dados locais por um banco de dados de verdade com login individual para cada colaborador, e (2) publicar o app. Vamos ativar a skill "vamos construir o back-end do meu app" para configurar o Supabase (banco de dados + login), e depois disso fazer o deploy na Vercel e instalar o app como PWA no celular.
