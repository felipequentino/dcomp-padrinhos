from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_session
from app.models import FreshmanSelection, MentorPair, Padrinho, PadrinhoSeed
from app.schemas import MentorPublic, PairOut

router = APIRouter(prefix="/api", tags=["pairs"])


async def _mentor_public(session: AsyncSession, matricula: str) -> MentorPublic:
    p = await session.scalar(
        select(Padrinho)
        .options(selectinload(Padrinho.seed))
        .where(Padrinho.matricula == matricula)
    )
    if p is None or p.seed is None:
        raise HTTPException(status_code=500, detail="Dados de padrinho incompletos")
    return MentorPublic(
        name=p.seed.nome_completo,
        matricula=p.matricula,
        music_artist=p.music_artist,
        computing_area=p.computing_area,
        celebrity=p.celebrity,
        dream_destination=p.dream_destination,
        hobby=p.hobby,
        favorite_series=p.favorite_series,
        personal_description=p.personal_description,
        photo_url=p.photo_url,
        whatsapp=p.whatsapp,
    )


@router.get("/pairs", response_model=list[PairOut])
async def list_pairs(
    course: str,
    session: AsyncSession = Depends(get_session),
) -> list[PairOut]:
    c = course.strip().upper()
    if c not in ("CC", "SI", "EC"):
        raise HTTPException(status_code=400, detail="Curso inválido (use CC, SI ou EC)")

    pairs = (await session.scalars(select(MentorPair).where(MentorPair.course == c))).all()
    out: list[PairOut] = []

    for mp in pairs:
        cnt = await session.scalar(
            select(func.count(FreshmanSelection.id)).where(FreshmanSelection.pair_id == mp.id)
        )
        taken = int(cnt or 0)
        available = max(0, mp.max_slots - taken)
        if available <= 0:
            continue
        m1 = await _mentor_public(session, mp.mentor_a_matricula)
        m2 = await _mentor_public(session, mp.mentor_b_matricula)
        out.append(
            PairOut(
                id=mp.id,
                course=mp.course,
                available_slots=available,
                max_slots=mp.max_slots,
                whatsapp_group_link=mp.whatsapp_group_link,
                mentors=[m1, m2],
            )
        )

    return out
