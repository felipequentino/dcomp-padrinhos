from pathlib import Path

from fastapi import APIRouter, Header, HTTPException

from app.config import settings
from app.database import SessionLocal
from app.services.forms_import import run_import_forms

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _check_secret(x_import_secret: str | None) -> None:
    if not settings.import_forms_secret.strip():
        raise HTTPException(
            status_code=503,
            detail="IMPORT_FORMS_SECRET não está configurado no servidor.",
        )
    if not x_import_secret or x_import_secret != settings.import_forms_secret:
        raise HTTPException(status_code=403, detail="Segredo inválido ou ausente (cabeçalho X-Import-Secret).")


@router.post("/import-forms")
async def import_forms(
    x_import_secret: str | None = Header(default=None, alias="X-Import-Secret"),
) -> dict[str, str | int]:
    """
    Importa `FORMS_CSV_PATH` para a tabela `padrinho_seed` (mesma lógica do script CLI).

    Envie o cabeçalho `X-Import-Secret` com o valor de `IMPORT_FORMS_SECRET` do `.env`.
    """
    _check_secret(x_import_secret)

    csv_path = Path(settings.forms_csv_path)
    try:
        async with SessionLocal() as session:
            n = await run_import_forms(session, csv_path)
            await session.commit()
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Arquivo CSV não encontrado: {csv_path.resolve()}",
        ) from None
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    return {
        "detail": "Importação concluída.",
        "imported_count": n,
        "csv_path": str(csv_path.resolve()),
    }
