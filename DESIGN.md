---
name: LuminaHub
description: Hub operacional interno da Lumina — precisão de missão crítica, design a serviço do trabalho.
colors:
  bg: "#080B0C"
  surface: "#0C1315"
  surface-2: "#111A1C"
  border: "#162023"
  border-2: "#1E2E31"
  fg: "#FFFFFF"
  fg-1: "#C0D8DC"
  fg-2: "#6A8A8D"
  fg-3: "#2E4447"
  cyan: "#00EAFF"
  cyan-hi: "#2AEDFF"
  teal: "#6AA9AF"
  negative: "#E55050"
  positive: "#33fc80"
typography:
  display:
    fontFamily: "Orbitron, sans-serif"
    fontSize: "clamp(28px, 3.5vw, 46px)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Orbitron, sans-serif"
    fontSize: "clamp(20px, 2.2vw, 32px)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.2em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  6: "24px"
  8: "32px"
  12: "48px"
  16: "64px"
  20: "80px"
components:
  button-primary:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.bg}"
    rounded: "{rounded.md}"
    padding: "13px 26px"
    typography: "Inter 600 14px"
  button-primary-hover:
    backgroundColor: "{colors.cyan-hi}"
    textColor: "{colors.bg}"
    rounded: "{rounded.md}"
    padding: "13px 26px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.fg-1}"
    rounded: "{rounded.md}"
    padding: "13px 22px"
  button-secondary-hover:
    backgroundColor: "rgba(106,169,175,0.07)"
    textColor: "{colors.teal}"
    rounded: "{rounded.md}"
    padding: "13px 22px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.fg-2}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.6}"
  card-raised:
    backgroundColor: "{colors.surface-2}"
    rounded: "{rounded.lg}"
    padding: "{spacing.6}"
  nav-item-default:
    backgroundColor: "transparent"
    textColor: "{colors.fg-2}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  nav-item-active:
    backgroundColor: "rgba(0,234,255,0.08)"
    textColor: "{colors.cyan}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg-1}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  chip-default:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.fg-2}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  chip-active:
    backgroundColor: "rgba(0,234,255,0.1)"
    textColor: "{colors.cyan}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
---

# Design System: LuminaHub

## 1. Overview

**Creative North Star: "O Centro de Controle"**

LuminaHub é uma sala de operações de missão crítica. Cada métrica visível sem abrir submenus. Cada ação acessível sem três cliques. O design parte de um princípio operacional, não estético: a equipe que usa esta interface trabalha sob pressão real e precisa de respostas imediatas. O sistema serve ao operador, nunca o contrário.

O fundo é void — quase preto com tinte frio (#080B0C), sem neutros quentes, sem gradientes decorativos. Sobre ele, superfícies em camadas progressivamente mais claras definem hierarquia por contraste tonal. A marca aparece em cyan elétrico (#00EAFF), com precisão cirúrgica: botões primários, estados ativos, métricas críticas. Fora desses pontos, o cyan está ausente. Sua raridade é o que dá peso.

A tipografia é uma divisão de funções. Orbitron carrega os títulos de seção e KPIs — peso técnico, identidade Lumina. Inter carrega 90% da interface — legível, eficiente, sem personalidade que distraia. JetBrains Mono marca labels, timestamps e numerais de status — código, não decoração. Três famílias com papéis não sobrepostos; cada fonte está onde nenhuma outra deveria estar.

**Key Characteristics:**
- Dark system por convicção, não por tendência: trabalho de longa duração em tela
- Densidade informacional intencional: nenhum dado escondido atrás de menus desnecessários
- Cyan como sinal, não como decoração: aparece somente onde importa
- Orbitron reservado para identidade e KPIs; Inter lidera a UI
- Responsivo e vivo: feedback imediato, transições rápidas, micro-animações funcionais
- Bordas sutis + glow pontual como linguagem de elevação — nunca sombras decorativas genéricas

---

## 2. Colors: The Void-and-Signal Palette

Paleta de contraste extremo: fundos quase negros com tinte frio e um único acento elétrico de alta saturação. Não há paleta quente, não há gradientes de propósito decorativo.

### Primary
- **Signal Cyan** (#00EAFF): O acento primário da Lumina. Usado exclusivamente em botões primários, itens de nav ativos, métricas de destaque, estados de foco, e indicadores de status positivo. Em média, cobre ≤10% de qualquer tela. Sua raridade é o que o torna efetivo.
- **Signal Cyan Hover** (#2AEDFF): Variante de hover do botão primário e de elementos interativos com cyan. Sempre acompanhado do glow suave (`0 8px 32px rgba(0,234,255,0.22)`).

### Secondary
- **Teal Confiante** (#6AA9AF): Acento secundário. Stats de suporte, ícones secundários, hover de botões ghost, borda de hover em inputs. Mais frio e menos saturado que o cyan — transmite confiança sem urgência.

### Tertiary
- **Vermelho Negativo** (#E55050): Reservado para erros, alertas críticos, itens "Problems/Pain". Nunca usado como decoração. A presença desse vermelho em tela significa que algo requer ação imediata.

### Neutral
- **Void** (#080B0C): Background da página. Near-black com tinte frio. Não é preto puro — o tinte cool harmoniza com o cyan.
- **Surface** (#0C1315): Background de cards, painéis, sidebars. Primeiro nível acima do void.
- **Surface Raised** (#111A1C): Background de cards elevados, tooltips, dropdowns. Segundo nível.
- **Border Subtle** (#162023): Borda padrão de cards e dividers. Quase invisível sobre surface — define estrutura sem ruído.
- **Border Strong** (#1E2E31): Borda de elementos interativos (buttons secondary) e hover de cards. Levemente mais visível.
- **White** (#FFFFFF): H1, numerais de hero, títulos Orbitron de máxima hierarquia. Restrito a esses contextos.
- **Fog-1** (#C0D8DC): Texto primário de corpo, títulos h3, labels de campos. Branco suavizado — legível no fundo escuro sem a dureza do puro branco.
- **Fog-2** (#6A8A8D): Texto secundário, legendas, placeholders, ícones inativos. Contraste suficiente (≥4.5:1 sobre surface), nunca mais claro que isso.
- **Fog-3** (#2E4447): Texto terciário — watermarks, numerais decorativos, micro-labels de estado. Não usado para texto funcional.

### Named Rules
**A Regra do Sinal Único.** O cyan (#00EAFF) é o único acento primário. Proibido introduzir um segundo acento saturado (roxo, laranja, verde-limão) para "enriquecer" a paleta. A leitura imediata de qualquer elemento cyan depende de não haver competidores.

**A Regra do Fundo Frio.** O background nunca usa tintes quentes. Nenhum `#0A0807`, nenhum tom com chroma hue nos 40-100 (amarelo-laranja). O tinte frio do bg harmoniza com o cyan; um bg quente cria dissonância de temperatura sem motivo.

---

## 3. Typography

**Display Font:** Orbitron (Google Fonts, weights 700-800)
**Body Font:** Inter (Google Fonts, optical size 14-32, weights 300-600)
**Label/Mono Font:** JetBrains Mono (Google Fonts, weights 400-500)

**Character:** Orbitron traz identidade Lumina — futurista, técnico, construído para KPIs e títulos de seção que precisam ter peso visual. Inter é o motor silencioso: legível em qualquer tamanho, sem personalidade que distraia do conteúdo. JetBrains Mono opera na camada de dados — timestamps, IDs, labels de status — onde a leitura técnica importa mais que a elegância.

### Hierarchy
- **Display** (Orbitron 700, `clamp(28px, 3.5vw, 46px)`, lh 1.1, ls -0.02em): Títulos de páginas principais e seções de alto impacto. Máximo dois por tela. Cor: `--fg` (#FFFFFF) ou `--cyan` (#00EAFF) para KPI de destaque.
- **Headline** (Orbitron 700, `clamp(20px, 2.2vw, 32px)`, lh 1.15, ls -0.02em): Subtítulos de painéis, títulos de módulo. Cor: `--fg` (#FFFFFF).
- **Title** (Inter 600, 15px, lh 1.3): Títulos de cards, rótulos de seção dentro de painéis, headings de tabela. Cor: `--fg-1` (#C0D8DC).
- **Body** (Inter 400, 15px, lh 1.7): Descrições, texto de suporte, conteúdo de notificações. Cor: `--fg-2` (#6A8A8D). Max line-length: 65ch.
- **Label** (JetBrains Mono 400, 11px, ls 0.2em, uppercase): Tags de status, timestamps, IDs de referência, numerais de métrica pequenos. Cor: `--fg-2` ou `--fg-3`. Usar com moderação — uppercase monospace é ruído se overused.

### Named Rules
**A Regra das Três Famílias.** Orbitron, Inter, JetBrains Mono. Nenhuma quarta família entra, mesmo que "combine bem". Mais de três famílias é indecisão, não riqueza.

**A Regra Orbitron-Contido.** Orbitron é proibido em texto de corpo, labels de campo, texto de botão, placeholders, ou qualquer elemento com mais de 6 palavras. Somente em títulos de seção, KPIs numéricos, e o logotipo. Quanto mais raro, mais peso tem quando aparece.

---

## 4. Elevation

Este sistema usa **bordas + glow pontual** como linguagem de profundidade. Sombras de caixa genéricas (drop shadows com blur ≥16px) são proibidas. A profundidade é comunicada por três mecanismos: (1) diferença de cor entre bg, surface e surface-raised, (2) bordas de 1px em tons progressivamente mais visíveis, e (3) glow cyan restrito a estados ativos e hover de elementos com acento primário.

### Shadow Vocabulary
- **Card repouso** (`border: 1px solid #162023`): Estrutura padrão de qualquer card ou painel. Sutil, define área sem ruído.
- **Card hover** (`border: 1px solid #1E2E31`): Borda ligeiramente mais visível ao hover. Confirma interatividade sem mover o elemento.
- **Glow primário** (`box-shadow: 0 8px 32px rgba(0,234,255,0.22)`): Aplicado exclusivamente a botões primários no hover e a elementos com estado ativo em cyan. Nunca usado como decoração em repouso.
- **Glow ambiente** (`background: radial-gradient(circle, rgba(0,234,255,0.05) 0%, transparent 70%)`): Background sutil de área de destaque (hero section de módulo, área de KPI principal). Não um card — um brilho de fundo.

### Named Rules
**A Regra Flat-por-Padrão.** Em repouso, nenhum elemento tem sombra. Profundidade vem de tonalidade de superfície e borda. Sombras e glows aparecem somente como resposta a estado (hover, active, focus). Uma interface cheia de sombras decorativas parece pesada; esta parece precisa.

**A Regra do Glow Exclusivo.** O glow cyan (`rgba(0,234,255,...)`) é reservado ao acento primário. Nunca aplicar glow em botões secundários, cards genéricos, ou ícones de suporte. Se aparecer em todo lugar, deixa de ser um sinal.

---

## 5. Components

### Buttons
Forma contida, ação clara. O botão primário é a única superfície com cor sólida de alta saturação na interface.

- **Shape:** Bordas arredondadas (8px — `--radius-md`). Nunca pill em botões de ação, nunca sharp (0px).
- **Primário:** Background `#00EAFF`, texto `#080B0C` (near-black), Inter 600 14px, padding 13px 26px. Único uso de texto escuro sobre fundo claro na interface.
- **Primário Hover:** Background `#2AEDFF`, `transform: translateY(-1px)`, `box-shadow: 0 8px 32px rgba(0,234,255,0.22)`. Transição `0.2s ease-out`.
- **Secundário:** Background transparente, texto `#C0D8DC`, borda `1px solid #1E2E31`. Hover: borda `#6AA9AF`, texto `#6AA9AF`, background `rgba(106,169,175,0.07)`.
- **Ghost:** Sem borda, sem background. Texto `#6A8A8D`. Para ações de baixa prioridade, usado dentro de painéis onde a hierarquia já está definida por contexto.

### Cards / Containers
Um card é uma superfície delimitada de trabalho, não um container decorativo.

- **Corner Style:** Suavemente arredondado (12px — `--radius-lg`). Nunca abaixo de 6px, nunca acima de 16px em cards de conteúdo.
- **Background:** `#0C1315` (surface padrão). Cards elevados ou tooltips usam `#111A1C`.
- **Shadow Strategy:** Flat em repouso com `border: 1px solid #162023`. Hover: `border: 1px solid #1E2E31`. Nunca `box-shadow` genérico decorativo.
- **Padding interno:** 24px (`--space-6`) como padrão. 16px em cards compactos de dashboard.

### Inputs / Fields
- **Style:** Background `#0C1315`, borda `1px solid #162023`, radius 8px, padding 10px 14px, Inter 400 15px, texto `#C0D8DC`, placeholder `#2E4447`.
- **Focus:** Borda `1px solid #00EAFF`, `box-shadow: 0 0 0 3px rgba(0,234,255,0.12)`. Sem mudança de background.
- **Error:** Borda `1px solid #E55050`, `box-shadow: 0 0 0 3px rgba(229,80,80,0.12)`.
- **Disabled:** Opacidade 0.4. Cursor `not-allowed`. Sem alteração de cor.

### Navigation (Sidebar)
Navegação lateral com hierarquia clara entre itens inativos e ativos.

- **Container:** Background `#080B0C` ou `#0C1315`, borda direita `1px solid #162023`.
- **Item padrão:** Texto `#6A8A8D`, Inter 400-500 14px, padding 10px 16px, radius 8px. Ícone `#2E4447` (ou `#6A8A8D` se o ícone for navegacional).
- **Item hover:** Texto `#C0D8DC`, ícone `#6A8A8D`, background `rgba(255,255,255,0.03)`.
- **Item ativo:** Texto `#00EAFF`, ícone `#00EAFF`, background `rgba(0,234,255,0.08)`. JetBrains Mono proibido no texto de nav — usar Inter.
- **Separadores:** Dividers `1px solid #162023`, spacing 8px acima e abaixo.

### Chips / Tags de Status
Labels compactos para status de tarefas, categorias, filtros.

- **Padrão:** Background `#111A1C`, texto `#6A8A8D`, radius 6px, padding 4px 10px, JetBrains Mono 400 11px uppercase ls 0.15em.
- **Ativo / Selecionado:** Background `rgba(0,234,255,0.1)`, texto `#00EAFF`, borda `1px solid rgba(0,234,255,0.2)`.
- **Negativo / Alerta:** Background `rgba(229,80,80,0.08)`, texto `#E55050`, borda `1px solid rgba(229,80,80,0.2)`.

### KPI Metric Card (Componente Assinatura)
O padrão central do dashboard: número grande + label + delta de período.

- **Número principal:** Orbitron 800, `clamp(28px, 3vw, 42px)`, cor `#FFFFFF` (ou `#00EAFF` para métrica de destaque máximo).
- **Label de métrica:** JetBrains Mono 400 11px, uppercase, ls 0.2em, cor `#6A8A8D`. Sempre acima do número.
- **Delta (variação):** Inter 600 13px. Positivo: `#00EAFF`. Negativo: `#E55050`. Precedido por `↑` ou `↓`. Abaixo do número.
- **Container:** Card padrão (surface, border, radius 12px, padding 20px 24px).

---

## 6. Do's and Don'ts

### Do:
- **Do** usar `#00EAFF` como o único acento primário. Um sinal, não uma paleta.
- **Do** reservar Orbitron para títulos de seção (Display/Headline) e numerais de KPI. Máximo 6 palavras, nunca em corpo ou labels de campo.
- **Do** usar `border: 1px solid #162023` como definidor padrão de card em repouso — sem sombra, sem glow.
- **Do** aplicar o glow cyan (`box-shadow: 0 8px 32px rgba(0,234,255,0.22)`) exclusivamente em hover do botão primário e estados ativos com acento cyan.
- **Do** usar `#C0D8DC` para texto primário e garantir contraste ≥4.5:1 sobre qualquer superfície escura.
- **Do** usar JetBrains Mono para labels de status, timestamps, IDs e numerais de métricas pequenas — onde a leitura técnica vence a elegância.
- **Do** manter densidade de informação alta: um dashboard deve mostrar o estado do sistema sem scroll.
- **Do** usar `transform: translateY(-1px)` + glow no hover de botões primários — a interface responde ao toque.
- **Do** testar `#6A8A8D` (Fog-2) contra o fundo da superfície em uso. Contraste ≥4.5:1 é obrigatório mesmo em texto secundário.

### Don't:
- **Don't** usar backgrounds quentes (`hue 40-100 com chroma > 0.01` em OKLCH, qualquer `#` com R > B significativamente). O sistema é frio por convicção.
- **Don't** introduzir um segundo acento saturado (roxo, laranja, verde-limão). Se o cyan precisa de um "companheiro", a paleta está errada, não incompleta.
- **Don't** usar `box-shadow` com blur ≥16px como decoração de card em repouso. Isso é o padrão SaaS genérico que este sistema rejeita.
- **Don't** usar `border-radius` acima de 16px em cards ou containers. Valores 24px+ leem como excesso de arredondamento — o que este sistema expressamente evita.
- **Don't** colocar Orbitron em labels de campo, texto de botão, placeholders, ou qualquer texto com mais de 6 palavras.
- **Don't** usar glassmorphism (`backdrop-filter: blur(...)` + `background: rgba(255,255,255,0.05)`) como padrão de card. Reservado para uso raramente intencional (modal overlay crítico), nunca como estilo padrão de container.
- **Don't** fazer uma interface que pareça SaaS genérico: sem cards coloridos com ícones ilustrativos, sem UI cheerful com espaçamento de landing page, sem hierarquia achata.
- **Don't** criar gradientes de texto (`background-clip: text`). Texto é sólido, hierarquia vem de peso e tamanho.
- **Don't** usar `border-left: 3px solid var(--cyan)` como acento decorativo em cards ou alertas. Stripe lateral não é bordas da Lumina — use tint de fundo ou borda completa.
- **Don't** usar o padrão AI-padrão 2026: fundo quente (creme, areia, bege), gradiente roxo-para-azul, glassmorphism decorativo. Este sistema é o oposto.
- **Don't** fazer o Orbitron aparecer em toda seção como eyebrow/kicker. O eyebrow repetido em todo bloco é gramática de IA saturada, não voz de marca.
