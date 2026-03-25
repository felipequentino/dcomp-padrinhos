"""
Importa inscrições do Google Forms (CSV) para padrinho_seed.

Uso (a partir da pasta backend, com venv ativo):
  python -m app.scripts.import_forms
"""

from __future__ import annotations

import asyncio
import csv
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.config import settings
from app.models import Base, PadrinhoSeed


def _norm_matricula(raw: str) -> str:
    s = (raw or "").strip()
    return "".join(c for c in s if c.isdigit()) or s


def _norm_course(raw: str) -> str:
    u = (raw or "").strip().upper()
    if u.startswith("SI") or " SI" in u:
        return "SI"
    if "EC" in u[:8] or u.startswith("EC"):
        return "EC"
    return "CC"


def _parse_foi(val: str) -> bool | None:
    v = (val or "").strip().lower()
    if v in ("sim", "s", "yes"):
        return True
    if v in ("não", "nao", "n"):
        return False
    return None


def _parse_ts(val: str) -> datetime | None:
    val = (val or "").strip()
    if not val:
        return None
    for fmt in ("%d/%m/%Y %H:%M:%S", "%d/%m/%Y %H:%M"):
        try:
            dt = datetime.strptime(val, fmt)
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def _header_key(fieldnames: list[str] | None) -> dict[str, str]:
    """Mapeia substring estável -> nome original da coluna."""
    if not fieldnames:
        return {}
    m: dict[str, str] = {}
    for fn in fieldnames:
        low = fn.strip().lower()
        if low.startswith("carimbo"):
            m["ts"] = fn
        elif "nome completo" in low:
            m["name"] = fn
        elif "matrícula" in low or "matricula" in low:
            m["matricula"] = fn
        elif low == "curso" or (low.startswith("curso") and "computação" not in low):
            m["course"] = fn
        elif "whatsapp" in low:
            m["whatsapp"] = fn
        elif "período atual" in low or "periodo atual" in low:
            m["periodo"] = fn
        elif "já foi padrinho" in low or "ja foi padrinho" in low:
            m["foi"] = fn
        elif "por que você deseja" in low or "por que voce deseja" in low:
            m["motivation"] = fn
    return m


def _read_rows(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        hk = _header_key(list(reader.fieldnames or []))
        required = {"ts", "name", "matricula", "course", "whatsapp", "motivation"}
        missing = required - set(hk.keys())
        if missing:
            raise SystemExit(f"Colunas não encontradas no CSV: {missing}. Headers: {reader.fieldnames}")

        rows: list[dict[str, str]] = []
        for row in reader:
            if not row:
                continue
            def pick(key: str) -> str:
                col = hk[key]
                return (row.get(col) or "").strip()

            rows.append(
                {
                    "ts": pick("ts"),
                    "name": pick("name"),
                    "matricula": pick("matricula"),
                    "course": pick("course"),
                    "whatsapp": pick("whatsapp"),
                    "periodo": pick("periodo") if "periodo" in hk else "",
                    "foi": pick("foi") if "foi" in hk else "",
                    "motivation": pick("motivation"),
                }
            )
        return rows


async def _run() -> None:
    csv_path = Path(settings.forms_csv_path)
    if not csv_path.is_file():
        raise SystemExit(f"Arquivo não encontrado: {csv_path.resolve()}")

    raw_rows = _read_rows(csv_path)
    best: dict[str, tuple[datetime | None, dict[str, str]]] = {}
    for r in raw_rows:
        m = _norm_matricula(r["matricula"])
        if not m or not re.match(r"^\d+$", m):
            continue
        ts = _parse_ts(r["ts"])
        prev = best.get(m)
        if prev is None or (ts and (prev[0] is None or ts > prev[0])):
            best[m] = (ts, r)

    engine = create_async_engine(settings.database_url, pool_pre_ping=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, expire_on_commit=False)
    async with Session() as session:
        for matricula, (_, r) in sorted(best.items()):
            ex = await session.scalar(select(PadrinhoSeed).where(PadrinhoSeed.matricula == matricula))
            if ex:
                ex.nome_completo = r["name"] or "—"
                ex.course = _norm_course(r["course"])
                ex.whatsapp = r["whatsapp"] or "—"
                ex.periodo = r["periodo"] or None
                ex.foi_padrinho_antes = _parse_foi(r["foi"])
                ex.motivation_text = r["motivation"] or ""
                ex.submitted_at = _parse_ts(r["ts"])
            else:
                session.add(
                    PadrinhoSeed(
                        matricula=matricula,
                        nome_completo=r["name"] or "—",
                        course=_norm_course(r["course"]),
                        whatsapp=r["whatsapp"] or "—",
                        periodo=r["periodo"] or None,
                        foi_padrinho_antes=_parse_foi(r["foi"]),
                        motivation_text=r["motivation"] or "",
                        submitted_at=_parse_ts(r["ts"]),
                    )
                )
        await session.commit()

    await engine.dispose()
    print(f"Importadas {len(best)} matrículas únicas (última resposta por matrícula).")


def main() -> None:
    asyncio.run(_run())


if __name__ == "__main__":
    main()
