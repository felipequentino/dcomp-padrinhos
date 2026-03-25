"""
Importa inscrições do Google Forms (CSV) para padrinho_seed.

Uso (pasta backend, venv ativo):
  python -m app.scripts.import_forms

Equivale a chamar POST /api/admin/import-forms com o segredo configurado.
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

from app.config import settings
from app.database import SessionLocal
from app.services.forms_import import run_import_forms


async def _run() -> None:
    csv_path = Path(settings.forms_csv_path)
    async with SessionLocal() as session:
        n = await run_import_forms(session, csv_path)
        await session.commit()
    print(f"Importadas {n} matrículas únicas (última resposta por matrícula).")


def main() -> None:
    try:
        asyncio.run(_run())
    except FileNotFoundError as e:
        print(f"Arquivo não encontrado: {e}", file=sys.stderr)
        raise SystemExit(1) from e
    except ValueError as e:
        print(e, file=sys.stderr)
        raise SystemExit(1) from e


if __name__ == "__main__":
    main()
