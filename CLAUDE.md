# LuminaHub — ERP Interno Lumina

ERP interno para gestão de projetos, tarefas, finanças, clientes e metas.

## Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + Reui
- **Backend**: Python 3.11+ + FastAPI
- **Database**: Supabase (PostgreSQL + Auth + Storage)

## Key Rules
- Sempre usar componentes existentes (shadcn/ui, Reui) — nunca criar do zero
- Caching/responsividade: todo `serverFetch` tagueado + `revalidate: 2`; toda mutação chama `revalidateCache([tags])` antes de `router.refresh()` (nunca só refresh); atualização ao vivo via Realtime (`<RealtimeRefresh>`) + `<AutoRefresh>` 20s de fallback — componente com `useState(prop)` deve sincronizar via `useEffect`. Tabela nova ao vivo: publication + lista em realtime-refresh.tsx
- `force-dynamic` + `revalidatePath` é **proibido**
- Performance DB: agregação via RPC (nunca loop Python/JS), índice em toda FK, `SET search_path = ''` em funções; **não** particionar/cursor-paginate nesta escala
- Interface em pt-BR, código/commits em inglês
- Todas as tabelas DEVEM ter `created_at`, `updated_at` (timestamptz) + RLS + trigger `update_updated_at`

**Performance & Caching (obrigatório p/ mudanças em dados/DB)**: [specs/performance-and-caching.md](specs/performance-and-caching.md)

<!-- SPECKIT START -->
**Active Feature Plan**: [specs/001-luminahub-erp/plan.md](specs/001-luminahub-erp/plan.md)
**Spec**: [specs/001-luminahub-erp/spec.md](specs/001-luminahub-erp/spec.md)
**Data Model**: [specs/001-luminahub-erp/data-model.md](specs/001-luminahub-erp/data-model.md)
**API Contracts**: [specs/001-luminahub-erp/contracts/api-endpoints.md](specs/001-luminahub-erp/contracts/api-endpoints.md)
<!-- SPECKIT END -->
