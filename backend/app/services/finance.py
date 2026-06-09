from __future__ import annotations

import calendar
from datetime import date, datetime

from supabase._async.client import AsyncClient


async def _totals(sb: AsyncClient, date_from: date, date_to: date) -> tuple[float, float]:
    """Return (revenue, expenses) for an inclusive date range.

    Summed in Postgres via the `finance_totals` RPC — one round-trip, no row
    transfer. The RPC always returns exactly one row (zero-filled when empty);
    numeric values arrive as strings over PostgREST, so we coerce with float().
    """
    resp = await sb.rpc(
        "finance_totals",
        {"p_from": date_from.isoformat(), "p_to": date_to.isoformat()},
    ).execute()
    row = (resp.data or [{}])[0]
    return float(row.get("revenue") or 0), float(row.get("expenses") or 0)


class FinanceService:
    def __init__(self, sb: AsyncClient) -> None:
        self.sb = sb

    async def get_summary(
        self,
        period: str,
        year: int,
        month: int,
    ) -> dict:
        month_start = date(year, month, 1)
        month_end = date(year, month, calendar.monthrange(year, month)[1])
        ytd_start = date(year, 1, 1)
        ytd_end = date(year, 12, 31)
        all_time_start = date(2000, 1, 1)

        # 3 aggregated round-trips (was 5 row-fetching ones).
        total_revenue, _ = await _totals(self.sb, all_time_start, ytd_end)
        month_revenue, month_expenses = await _totals(self.sb, month_start, month_end)
        ytd_revenue, ytd_expenses = await _totals(self.sb, ytd_start, ytd_end)

        return {
            "period": period,
            "total_revenue": total_revenue,
            "total_expenses": ytd_expenses,
            "net_profit": month_revenue - month_expenses,
            "year_to_date_revenue": ytd_revenue,
            "year_to_date_expenses": ytd_expenses,
            "month_revenue": month_revenue,
            "month_expenses": month_expenses,
        }

    async def get_chart_data(self, chart_type: str, year: int) -> list[dict]:
        # Single round-trip for all 12 months (was 24).
        resp = await self.sb.rpc(
            "finance_monthly_totals", {"p_year": year}
        ).execute()
        by_month = {int(r["month"]): r for r in (resp.data or [])}

        result = []
        for m in range(1, 13):
            row = by_month.get(m) or {}
            result.append({
                "month": m,
                "month_label": date(year, m, 1).strftime("%b"),
                "revenue": float(row.get("revenue") or 0),
                "expenses": float(row.get("expenses") or 0),
            })
        return result

    async def get_projection(self, year: int) -> dict:
        today = datetime.today()
        current_month = today.month

        # 3-month rolling average using last 3 completed months
        months_back = []
        for delta in range(1, 4):
            m = current_month - delta
            y = year
            if m <= 0:
                m += 12
                y -= 1
            months_back.append((y, m))

        rolling_revenues = []
        for y, m in months_back:
            start = date(y, m, 1)
            end = date(y, m, calendar.monthrange(y, m)[1])
            rev, _ = await _totals(self.sb, start, end)
            rolling_revenues.append(rev)

        avg = sum(rolling_revenues) / len(rolling_revenues) if rolling_revenues else 0.0
        months_remaining = max(0, 12 - current_month)

        ytd_start = date(year, 1, 1)
        ytd_end = date(year, current_month, calendar.monthrange(year, current_month)[1])
        ytd_revenue, _ = await _totals(self.sb, ytd_start, ytd_end)

        projected = ytd_revenue + avg * months_remaining

        return {
            "projected_year_revenue": projected,
            "avg_monthly_revenue": avg,
            "months_remaining": months_remaining,
        }

    async def get_split(self, from_date: date, to_date: date) -> dict:
        total, _ = await _totals(self.sb, from_date, to_date)
        per_partner = total / 2

        return {
            "total_income": total,
            "per_partner": per_partner,
            "partner_names": ["Lucas", "Ricardo"],
        }
