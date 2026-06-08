# Feature Specification: LuminaHub ERP — Sistema de Gestão Interno

**Status**: Draft
**Author**: Lucas
**Created**: 2026-06-04
**Last Updated**: 2026-06-04
**Constitution Version**: 1.0.0

---

## 1. Overview

LuminaHub é o ERP interno da empresa Lumina. Centraliza gestão de projetos, tarefas, finanças, clientes e metas em um único sistema web. O objetivo é eliminar o uso de ferramentas dispersas (planilhas, apps externos) e oferecer visibilidade em tempo real sobre o desempenho da empresa. O sistema é de uso exclusivo da equipe interna (atualmente Lucas e Ricardo).

---

## 2. Goals

- Centralizar gestão de tarefas, projetos, finanças e clientes em um só lugar.
- Prover visibilidade de metas e desempenho da empresa em tempo real.
- Substituir planilhas manuais por lançamentos estruturados e rastreáveis.
- Permitir particionamento de receitas entre os sócios (50/50).
- Oferecer experiência fluida e visualmente clara, reduzindo fricção operacional.

---

## 3. Non-Goals

- Não é um sistema multitenancy / SaaS para clientes externos.
- Formulários (Aba Formulários) estão fora do escopo desta iteração — serão desenvolvidos posteriormente.
- Integração com sistemas externos (bancos, ERPs de terceiros) não é requisito inicial.
- Aplicativo mobile não faz parte deste escopo.

---

## 4. Actors

| Ator | Descrição |
|------|-----------|
| Usuário autenticado | Membro da equipe Lumina (Lucas ou Ricardo). Acesso completo a todas as abas. |
| Administrador | Mesmo que usuário autenticado neste estágio — sem hierarquia de permissões diferenciada por ora. |

---

## 5. Módulos & Requisitos Funcionais

### 5.1 — Navegação Global

| ID | Requisito | Prioridade |
|----|-----------|------------|
| NAV-01 | Sidebar lateral fixa com links para todos os módulos. | Must |
| NAV-02 | Item "Tarefas" no sidebar tem dropdown com sub-itens "Projetos" e "Tarefas Internas". | Must |
| NAV-03 | Cada sub-item do dropdown "Tarefas" exibe badge numérico com contagem de tarefas atribuídas ao usuário logado. | Must |
| NAV-04 | Sidebar responsiva — colapsável em telas menores. | Should |
| NAV-05 | Rota de autenticação protege todas as páginas internas. | Must |

---

### 5.2 — Aba Home

| ID | Requisito | Prioridade |
|----|-----------|------------|
| HOME-01 | Exibe background/ilustração visual da identidade da Lumina. | Must |
| HOME-02 | Seção de resumo abaixo do background mostra: metas ativas em andamento, tarefas de alta prioridade atribuídas ao usuário logado, e métricas financeiras resumidas (receita do mês). | Must |
| HOME-03 | Widgets da Home são clicáveis e redirecionam para o módulo correspondente. | Should |

---

### 5.3 — Aba Métricas

| ID | Requisito | Prioridade |
|----|-----------|------------|
| MET-01 | Exibe painel visual com: total de tarefas concluídas, total de metas atingidas, e resumo de processos em andamento. | Must |
| MET-02 | Permite filtrar dados por período: semana, mês, trimestre, ano, ou intervalo personalizado. | Must |
| MET-03 | CRUD de metas: criar, editar, visualizar, concluir e excluir metas. | Must |
| MET-04 | Metas suportam dois tipos: **numeral** (ex: "Faturar R$ 50.000") com valor alvo e valor atual, e **simbólica** (ex: "Fechar 5 clientes novos") com status de conclusão manual. | Must |
| MET-05 | Metas têm: nome, tipo, descrição opcional, data de início, data alvo (prazo), e data de conclusão efetiva. | Must |
| MET-06 | Metas numéricas exibem barra de progresso percentual (valor atual / valor alvo). | Must |
| MET-07 | Resumo da empresa em período selecionado é exibido em cards visuais com boa legibilidade. | Must |
| MET-08 | Metas concluídas ficam em seção separada das metas ativas. | Should |
| MET-09 | Cadastro retroativo de metas: DEVE aceitar datas de início e término no passado. Metas já concluídas no passado podem ser registradas com `completed_at` retroativo e alimentam o histórico de métricas. | Must |

---

### 5.4 — Aba Tarefas: Projetos

| ID | Requisito | Prioridade |
|----|-----------|------------|
| PROJ-01 | Listagem de projetos como seções horizontais lado a lado (scroll horizontal), cada uma representando um projeto. | Must |
| PROJ-02 | Criar, renomear e arquivar projetos. | Must |
| PROJ-03 | Cada projeto contém colunas customizáveis (ex: "A fazer", "Em andamento", "Concluído"). | Must |
| PROJ-04 | Colunas são criáveis, renomeáveis e reordenáveis dentro de um projeto. | Must |
| PROJ-05 | Tarefas são cartões arrastáveis entre colunas (drag-and-drop) e entre projetos. | Must |
| PROJ-06 | Cartão de tarefa contém: título, descrição, prioridade (Baixa / Média / Alta / Urgente), responsável (usuário), data de vencimento, e etiquetas/tags. | Must |
| PROJ-07 | Filtro por responsável, prioridade e etiqueta dentro de um projeto. | Should |
| PROJ-08 | Contagem de tarefas do usuário logado refletida no badge do sidebar em tempo real. | Must |

---

### 5.5 — Aba Tarefas: Tarefas Internas

| ID | Requisito | Prioridade |
|----|-----------|------------|
| TINT-01 | Área de tarefas avulsas (não vinculadas a nenhum projeto) com uma única seção Kanban. | Must |
| TINT-02 | Mesmas funcionalidades do módulo Projetos: colunas, drag-and-drop, prioridade, responsável, data, tags. | Must |
| TINT-03 | Contagem de tarefas internas do usuário logado refletida no badge do sidebar. | Must |

---

### 5.6 — Aba Finanças

| ID | Requisito | Prioridade |
|----|-----------|------------|
| FIN-01 | Painel de cards financeiros com: receita bruta total, receita do mês atual, receita do ano, despesas do mês, lucro líquido do mês. | Must |
| FIN-02 | Gráficos de evolução mensal e anual de receitas e despesas. | Must |
| FIN-03 | Projeção de longevidade: com base na média dos últimos meses, calcula estimativa de receita até o fim do ano. | Must |
| FIN-04 | Lançamentos manuais de ganhos (crédito) e perdas (débito) diretamente na aba finanças. | Must |
| FIN-05 | Cada lançamento tem: tipo (ganho/perda), valor, descrição, data de competência, data de criação. | Must |
| FIN-06 | Cálculo automático de particionamento 50/50 entre Lucas e Ricardo para qualquer período selecionado. | Must |
| FIN-07 | Dados financeiros originados da aba Clientes (serviços e pagamentos) são automaticamente consolidados nesta aba. | Must |
| FIN-08 | Filtro por período: mês, trimestre, ano, intervalo personalizado. | Must |
| FIN-09 | Visualização histórica de métricas de meses/anos anteriores. | Must |
| FIN-10 | Exportação de relatório financeiro do período em PDF ou CSV. | Should |
| FIN-11 | Lançamentos manuais aceitam data de competência no passado — permite registrar receitas e despesas retroativas que alimentam gráficos e projeções históricas. | Must |

---

### 5.7 — Aba Clientes

| ID | Requisito | Prioridade |
|----|-----------|------------|
| CLI-01 | CRUD de clientes: nome, contato, observações, status (ativo/inativo). | Must |
| CLI-02 | Cada cliente pode ter múltiplos serviços vinculados. | Must |
| CLI-03 | Serviço tem: nome, tipos (seleção múltipla: Automação, Site de Gestão, Site Marketing — extensível), data de início, data de término estimada, e status. | Must |
| CLI-04 | Cada serviço pode ter múltiplos lançamentos de ganhos com modalidades de pagamento: **à vista** (valor único na data), **parcelado** (valor total, número de parcelas, data da 1ª parcela), ou **pós-entrega** (valor único na data de conclusão do desenvolvimento). | Must |
| CLI-05 | Ganhos lançados em serviços são automaticamente propagados para a aba Finanças. | Must |
| CLI-06 | Despesas podem ser vinculadas a um cliente (ex: custo de ferramentas, hospedagem dedicada). | Should |
| CLI-07 | Contratos podem ser vinculados ao cliente como arquivos ou URLs. | Should |
| CLI-08 | Página de detalhe do cliente exibe histórico de serviços, totais recebidos, e totais em aberto. | Must |
| CLI-09 | Parcelas com status de recebido/pendente, para rastreamento de fluxo de caixa. | Must |
| CLI-10 | Cadastro retroativo: DEVE ser possível registrar clientes, serviços e pagamentos com datas no passado. Todos os campos de data (início, término, vencimento de parcelas, data de pagamento) aceitam datas passadas livremente. Parcelas passadas podem ser marcadas como "já pagas" com data retroativa. Dados retroativos DEVEM alimentar gráficos e métricas históricas em Finanças e Métricas. | Must |
| CLI-11 | Serviços permitem status "concluído" com data de término efetiva no passado (ex: contrato iniciado em fevereiro, finalizado em maio). | Must |

---

### 5.8 — Aba Formulários (Fora do Escopo)

A aba Formulários (similar ao Google Forms) está registrada na navegação como placeholder, mas **não será desenvolvida nesta iteração**. A entrada deve aparecer no sidebar como desabilitada/em breve.

---

## 6. User Scenarios & Fluxos Principais

### Cenário A — Acompanhar o dia a dia
1. Usuário acessa Home e vê metas em andamento e tarefas prioritárias.
2. Clica em uma tarefa → vai para Projetos ou Tarefas Internas no cartão correspondente.

### Cenário B — Registrar novo cliente e serviço
1. Vai para Clientes → cria novo cliente.
2. Dentro do cliente, cria serviço com tipo "Site de Gestão".
3. Adiciona lançamento de ganho: R$ 6.000 em 3 parcelas de R$ 2.000.
4. Parcelas aparecem em Finanças com datas de competência.

### Cenário C — Verificar saúde financeira
1. Vai para Finanças → vê cards com receita do mês, lucro líquido, e projeção anual.
2. Filtra por "Ano 2026" → vê gráfico de evolução mês a mês.
3. Vê partição 50/50: Lucas R$ X, Ricardo R$ X.

### Cenário D — Criar e acompanhar meta
1. Vai para Métricas → cria meta numeral "Faturar R$ 100k em 2026", prazo 2026-12-31.
2. Conforme serviços são recebidos, o valor atual da meta é atualizado.
3. Ao atingir R$ 100k, marca como concluída.

### Cenário E — Gerenciar projeto Kanban
1. Cria projeto "Site Marketing - Cliente X".
2. Adiciona colunas: Backlog, Em desenvolvimento, Revisão, Concluído.
3. Cria tarefas, atribui a Lucas, define prioridade Alta.
4. Arrasta tarefa de "Backlog" para "Em desenvolvimento".

---

## 7. Entidades de Dados Principais

| Entidade | Campos-chave | Relações |
|----------|-------------|----------|
| `users` | id, name, email, avatar_url | — |
| `goals` | id, name, type, target_value, current_value, status, start_date, target_date, completed_at, created_at, updated_at | — |
| `projects` | id, name, status, created_at, updated_at | — |
| `boards` | id, project_id (nullable = Tarefas Internas), name, position, created_at, updated_at | projects |
| `tasks` | id, board_id, column_id, title, description, priority, assignee_id, due_date, tags, position, created_at, updated_at | boards, users |
| `clients` | id, name, contact, notes, status, created_at, updated_at | — |
| `services` | id, client_id, name, types[], start_date, end_date_estimated, status, created_at, updated_at | clients |
| `service_payments` | id, service_id, modality (upfront/installment/post_delivery), total_amount, installment_count, first_payment_date, created_at, updated_at | services |
| `payment_installments` | id, service_payment_id, amount, due_date, paid_at, status, created_at, updated_at | service_payments |
| `transactions` | id, type (income/expense), amount, description, competence_date, source_type, source_id, created_at, updated_at | polymorphic |

---

## 8. Success Criteria

| # | Critério | Como medir |
|---|----------|------------|
| SC-01 | Todos os módulos acessíveis em menos de 2 segundos após login. | Tempo de carregamento de rota no browser. |
| SC-02 | Drag-and-drop de tarefas funciona sem erro em qualquer coluna/projeto. | Testes de interação + uso real. |
| SC-03 | Ganho lançado em Clientes aparece em Finanças no mesmo dia sem ação manual. | Verificação cruzada dos dados. |
| SC-04 | Partição 50/50 é calculada corretamente para qualquer período. | Validação matemática com dados reais. |
| SC-05 | Metas numéricas atualizam progresso automaticamente conforme receitas são lançadas (quando vinculadas). | Verificação de consistência. |
| SC-06 | Usuário consegue registrar cliente, serviço e pagamento em menos de 3 minutos. | Teste de usabilidade cronometrado. |
| SC-07 | Sistema operacional com dois usuários simultâneos sem conflitos de dados. | Teste de concorrência. |

---

## 9. Assumptions (Decisões por padrão)

- **Autenticação**: Supabase Auth com e-mail/senha. Sem OAuth externo nesta fase.
- **Permissões**: Ambos os usuários (Lucas e Ricardo) têm acesso irrestrito a todos os módulos. RBAC pode ser adicionado futuramente.
- **Moeda**: BRL (R$) como única moeda.
- **Idioma**: Português (pt-BR) na interface.
- **Metas numéricas e finanças**: Modelo híbrido (opção C). Campo `auto_source` nullable na meta. Se `auto_source = 'revenue'`, `current_value` calcula automaticamente via soma de transactions do período. Se `auto_source = null`, `current_value` é editável manualmente. Metas simbólicas sempre manuais.
- **Arquivos de contrato**: Upload de arquivos armazenado no Supabase Storage; limite inicial de 10MB por arquivo.
- **Projeção financeira**: Baseada na média dos últimos 3 meses completos.
- **Cadastro retroativo**: Todos os módulos (Clientes, Serviços, Pagamentos, Metas, Lançamentos financeiros) DEVEM aceitar datas no passado. Não há restrição de "data mínima". Dados retroativos alimentam gráficos, projeções e métricas históricas normalmente. Formulários de cadastro não bloqueiam datas passadas — DatePickers sem restrição de min-date.
- **Aba Formulários**: Aparece no sidebar como "Em breve" (disabled), sem funcionalidade.

---

## 10. Dependencies

- Supabase (Auth, Database, Storage)
- Biblioteca de drag-and-drop para Kanban (ex: `@hello-pangea/dnd` ou `dnd-kit`)
- Biblioteca de gráficos (ex: Recharts)
- Geração de PDF para exportação de relatórios financeiros

---

## 11. Open Questions

- [x] ~~Metas numéricas devem se autoatualizar com base nos lançamentos financeiros do período, ou o valor atual é sempre manual?~~ **Resolvido**: Modelo híbrido — `auto_source` nullable. Automático quando `auto_source='revenue'`, manual quando `null`.
