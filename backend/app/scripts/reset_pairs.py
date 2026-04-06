"""
Reseta as duplas de padrinhos, deletando todos os MentorPairs que não
possuem nenhum FreshmanSelection vinculado.

Uso (pasta backend, venv ativo):
  python -m app.scripts.reset_pairs
"""

import asyncio

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.config import settings
from app.models import Base, MentorPair, FreshmanSelection


async def _run() -> None:
    engine = create_async_engine(settings.database_url, pool_pre_ping=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, expire_on_commit=False)
    async with Session() as session:
        async with session.begin():
            # Identifica os pair_ids que têm pelo menos 1 calouro vinculado
            used_pair_ids = (
                await session.scalars(select(FreshmanSelection.pair_id).distinct())
            ).all()

            # Conta quantas duplas existem antes
            all_pairs = (await session.scalars(select(MentorPair))).all()
            total_before = len(all_pairs)
            protected = len(used_pair_ids)

            # Deleta apenas as duplas sem calouros
            result = await session.execute(
                delete(MentorPair).where(MentorPair.id.not_in(used_pair_ids))
                if used_pair_ids
                else delete(MentorPair)
            )
            deleted = result.rowcount

    await engine.dispose()

    print("=== Reset de Duplas ===")
    print(f"Total antes:           {total_before}")
    print(f"Duplas protegidas (com calouros): {protected}")
    print(f"Duplas deletadas:      {deleted}")
    print("======================")


def main() -> None:
    asyncio.run(_run())


if __name__ == "__main__":
    main()
