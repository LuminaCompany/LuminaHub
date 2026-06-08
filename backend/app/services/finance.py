from __future__ import annotations

from datetime import date
from decimal import Decimal

from supabase._async.client import AsyncClient

_TABLE = "transactions"


async def _sum_by_type(
    sb: AsyncClient,
    tx_type: str,
    date_from: date,
    date_to: date,
) -> Decimal:
    response = await (
        sb.table(_TABLE)
        .select("amount")
        .eq("type", tx_type)
        .gte("competence_date", date_from.isoformat())
        .lte("competence_date", date_to.isoformat())
    )
    rows = response.data or []
    return sum((Decimal(str(r["amount"])) for r in rows), Decimal("0"))


class FinanceService:
    def __init__(self, sb: AsyncClient) -> None:
        self.sb = sb

    async def get_summary(
        self,
        period: str,
        year: int,
        month: int,
    ) -> dict:
        import calendar

        month_start = date(year, month, 1)
        month_end = date(year, month, calendar.monthrange(year, month)[1])
        ytd_start = date(year, 1, 1)
        ytd_end = date(year, 12, 31)
        all_time_start = date(2000, 1, 1)

        total_revenue = await _sum_by_type(self.sb, "income", all_time_start, ytd_end)
        month_revenue = await _sum_by_type(self.sb, "income", month_start, month_end)
        month_expenses = await _sum_by_type(self.sb, "expense", month_start, month_end)
        ytd_revenue = await _sum_by_type(self.sb, "income", ytd_start, ytd_end)
        ytd_expenses = await _sum_by_type(self.sb, "expense", ytd_start, ytd_end)

        return {
            "period": period,
            "total_revenue": float(total_revenue),
            "total_expenses": float(ytd_expenses),
            "net_profit": float(month_revenue - month_expenses),
            "year_to_date_revenue": float(ytd_revenue),
            "year_to_date_expenses": float(ytd_expenses),
            "month_revenue": float(month_revenue),
            "month_expenses": float(month_expenses),
        }

    async def get_chart_data(self, chart_type: str, year: int) -> list[dict]:
        import calendar

        result = []
        for m in range(1, 13):
            start = date(year, m, 1)
            end = date(year, m, calendar.monthrange(year, m)[1])
            revenue = await _sum_by_type(self.sb, "income", start, end)
            expenses = await _sum_by_type(self.sb, "expense", start, end)
            result.append({
                "month": m,
                "month_label": start.strftime("%b"),
                "revenue": float(revenue),
                "expenses": float(expenses),
            })
        return result

    async def get_projection(self, year: int) -> dict:
        import calendar
        from datetime import datetime

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
            rev = await _sum_by_type(self.sb, "income", start, end)
            rolling_revenues.append(float(rev))

        avg = sum(rolling_revenues) / len(rolling_revenues) if rolling_revenues else 0.0
        months_remaining = max(0, 12 - current_month)

        ytd_start = date(year, 1, 1)
        ytd_end = date(year, current_month, calendar.monthrange(year, current_month)[1])
        ytd_revenue = float(await _sum_by_type(self.sb, "income", ytd_start, ytd_end))

        projected = ytd_revenue + avg * months_remaining

        return {
            "projected_year_revenue": projected,
            "avg_monthly_revenue": avg,
            "months_remaining": months_remaining,
        }

    async def get_split(self, from_date: date, to_date: date) -> dict:
        total = await _sum_by_type(self.sb, "income", from_date, to_date)
        per_partner = float(total) / 2

        return {
            "total_income": float(total),
            "per_partner": per_partner,
            "partner_names": ["Lucas", "Ricardo"],
        }
