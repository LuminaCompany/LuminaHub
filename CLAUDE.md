# LuminaHub — ERP Interno Lumina

ERP interno para gestão de projetos, tarefas, finanças, clientes e metas.

## Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + Reui
- **Backend**: Python 3.11+ + FastAPI
- **Database**: Supabase (PostgreSQL + Auth + Storage)

## Key Rules
- Sempre usar componentes existentes (shadcn/ui, Reui) — nunca criar do zero
- Caching: `unstable_cache` + `revalidateTag` + `loading.tsx` em todas as rotas
- `force-dynamic` + `revalidatePath` é **proibido**
- Interface em pt-BR, código/commits em inglês
- Todas as tabelas DEVEM ter `created_at`, `updated_at` (timestamptz)

<!-- SPECKIT START -->
**Active Feature Plan**: [specs/001-luminahub-erp/plan.md](specs/001-luminahub-erp/plan.md)
**Spec**: [specs/001-luminahub-erp/spec.md](specs/001-luminahub-erp/spec.md)
**Data Model**: [specs/001-luminahub-erp/data-model.md](specs/001-luminahub-erp/data-model.md)
**API Contracts**: [specs/001-luminahub-erp/contracts/api-endpoints.md](specs/001-luminahub-erp/contracts/api-endpoints.md)
<!-- SPECKIT END -->
