# Performance & Caching — Guia de Boas Práticas (LuminaHub)

Guia obrigatório para **toda alteração futura** que toque dados, cache ou banco.
Objetivo: site rápido, requisições mínimas, atualização instantânea.

Resumo da arquitetura que torna isto válido:
**Frontend (Next 16/React 19) → FastAPI (service-role key) → Supabase.**
RLS é **bypassado no hot path** (backend usa service-role). Tabelas pequenas
(dezenas de linhas), 2 usuários. Tudo abaixo parte desse modelo.

---

## 1. Cache & responsividade (frontend)

Modelo: **fetch tagueado + `revalidate` curto + purge da tag na mutação**.
Resultado: a tua própria mudança aparece instantânea (read-your-own-writes); a
mudança do outro usuário aparece em ≤ 5s.

### Regras
1. **Todo `serverFetch` leva `tags` + `revalidate: 5`.** Nunca deixar fetch sem
   tag. (Exceção: dados sempre-frescos como Settings → `revalidate: 0`.)
2. **Toda mutação chama `revalidateCache([...tags])` ANTES de `router.refresh()`.**
   `router.refresh()` sozinho NÃO limpa o Data Cache — re-renderiza sobre cache
   velho. Só o purge da tag (Server Action) transforma o refresh em cache MISS.
3. **Nunca** usar `force-dynamic` + `revalidatePath` (proibido — ver CLAUDE.md).
4. Aba "lenta pra atualizar" = quase sempre mutação nova só com `router.refresh()`
   sem `revalidateCache`. **Corrige adicionando a tag certa, não baixando o
   `revalidate`.**

### Onde fica
- Tags: `frontend/src/lib/cache.ts` (`CACHE_TAGS`).
- Helpers de purge: `frontend/src/lib/cache.server.ts`
  (usa `revalidateTag(tag, "")` — neste Next o **2º argumento é obrigatório**).
- Server Action genérica: `frontend/src/actions/cache.ts` → `revalidateCache(tags)`.

### Mapa mutação → tags (referência)
| Mutação | Tags a purgar |
|---|---|
| Cliente (criar/editar) | `clients` |
| Serviço | `clients`, `services` |
| Pagamento (criar plano) | `clients`, `services` |
| Parcela paga (gera transação) | `clients`, `services`, `transactions`, `home`, `goals` |
| Contrato | `clients` |
| Kanban projeto (task/coluna/projeto) | `projects`, `tasks`, `home` |
| Kanban interno | `internal-tasks`, `tasks`, `home` |
| Meta (criar/editar/concluir/excluir) | `goals`, `home` |
| Usuário/perfil/permissões | `users` |

> Kanban move/reorder são **otimistas** (UI muda na hora) e também purgam as tags
> no sucesso, pra um reload refletir a verdade.

---

## 2. Banco & queries (Supabase/Postgres)

### Faça
- **Agregação no Postgres, não em Python.** Somatórios/contagens via RPC com
  `SUM`/`GROUP BY` (ex.: `finance_totals`, `finance_monthly_totals`). Evita
  puxar linhas e elimina N+1 de round-trips HTTP (o gráfico financeiro caiu de
  24 chamadas para 1).
- **Operações em lote via RPC** em vez de loop de `UPDATE` (ex.: `reorder_columns`
  faz tudo num `UPDATE` atômico).
- **Índice em toda FK** usada em join/filtro. Índice **composto** quando há
  `WHERE x ORDER BY y` (ex.: `tasks(column_id, position)`); o composto já cobre
  a FK pela coluna à esquerda.
- **Funções com `SET search_path = ''`** + nomes de tabela qualificados
  (`public.x`). Segurança + evita resolução de search_path.
- Toda tabela: `created_at` + `updated_at` (timestamptz) + trigger
  `update_updated_at` + RLS habilitada.
- Rodar `get_advisors` (performance + security) após mudanças de DDL.

### Não faça (não-viável nesta escala — não perca tempo)
- **Particionamento** de tabela (linhas em dezenas → inútil).
- **Paginação por cursor** (offset/range já basta).
- **Covering/partial indexes** especulativos (ganho zero neste volume).
- **Tuning de connection pool** — o backend fala PostgREST sobre HTTP, não
  conexão PG direta.
- Remover índice "unused" — está ocioso só porque a tabela está quase vazia;
  vai servir filtros conforme cresce.

### Segurança (pendências conhecidas, não-perf)
- Políticas RLS de escrita ainda `USING (true)` — defesa em profundidade só
  importa pra acesso PostgREST direto (o app usa service-role). Apertar é
  opcional e arriscado (quebra writes anon do frontend). Decidir antes.
- Ativar proteção de senha vazada (HaveIBeenPwned) no dashboard do Supabase.

---

## 3. Checklist pra PR que toca dados
- [ ] Fetch novo tem `tags` + `revalidate: 5`?
- [ ] Mutação nova chama `revalidateCache([tags corretas])` antes do refresh?
- [ ] Agregação pesada está em RPC (não em loop Python/JS)?
- [ ] Tabela/coluna nova: `created_at`/`updated_at`, RLS, índice de FK?
- [ ] Função nova: `SET search_path = ''` + refs qualificadas?
- [ ] Rodou `get_advisors` e revisou os WARN?
