from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_session
from app.models import FreshmanSelection, MentorPair, Padrinho
from app.schemas import FreshmanRegisterIn, FreshmanRegisterOut
from app.services.email import send_freshman_chose_pair_email

router = APIRouter(prefix="/api/freshman", tags=["freshman"])


async def _notify_mentors(
    mentor_a_email: str,
    mentor_b_email: str,
    mentor_a_name: str,
    mentor_b_name: str,
    freshman_name: str,
    freshman_phone: str,
    freshman_matricula: str,
    freshman_course: str,
) -> None:
    await send_freshman_chose_pair_email(
        mentor_a_email,
        mentor_a_name,
        freshman_name,
        freshman_phone,
        freshman_matricula,
        freshman_course,
    )
    await send_freshman_chose_pair_email(
        mentor_b_email,
        mentor_b_name,
        freshman_name,
        freshman_phone,
        freshman_matricula,
        freshman_course,
    )


@router.post("/register-and-select", response_model=FreshmanRegisterOut)
async def register_and_select(
    body: FreshmanRegisterIn,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
) -> FreshmanRegisterOut:
    if not body.terms_accepted:
        raise HTTPException(status_code=400, detail="É necessário aceitar os termos")

    async with session.begin():
        mp = await session.scalar(select(MentorPair).where(MentorPair.id == body.pair_id))
        if mp is None:
            raise HTTPException(status_code=404, detail="Dupla não encontrada")

        if mp.course != body.course:
            raise HTTPException(status_code=400, detail="Esta dupla não pertence ao curso informado")

        dup = await session.scalar(
            select(FreshmanSelection).where(FreshmanSelection.freshman_matricula == body.freshman_matricula)
        )
        if dup is not None:
            raise HTTPException(status_code=400, detail="Esta matrícula já escolheu uma dupla")

        pa = await session.scalar(
            select(Padrinho)
            .options(selectinload(Padrinho.seed))
            .where(Padrinho.matricula == mp.mentor_a_matricula)
        )
        pb = await session.scalar(
            select(Padrinho)
            .options(selectinload(Padrinho.seed))
            .where(Padrinho.matricula == mp.mentor_b_matricula)
        )
        if pa is None or pb is None or pa.seed is None or pb.seed is None:
            raise HTTPException(status_code=500, detail="Padrinhos da dupla não estão cadastrados")

        cnt = await session.scalar(
            select(func.count(FreshmanSelection.id)).where(FreshmanSelection.pair_id == body.pair_id)
        )
        taken = int(cnt or 0)
        if taken >= mp.max_slots:
            raise HTTPException(status_code=400, detail="Sem vagas nesta dupla")

        session.add(
            FreshmanSelection(
                freshman_matricula=body.freshman_matricula,
                name=body.name.strip(),
                phone=body.phone.strip(),
                course=body.course,
                terms_accepted_at=datetime.now(timezone.utc),
                pair_id=body.pair_id,
            )
        )

    background_tasks.add_task(
        _notify_mentors,
        pa.email,
        pb.email,
        pa.seed.nome_completo,
        pb.seed.nome_completo,
        body.name.strip(),
        body.phone.strip(),
        body.freshman_matricula,
        body.course,
    )

    return FreshmanRegisterOut(
        pair_id=mp.id,
        mentor_a_name=pa.seed.nome_completo,
        mentor_b_name=pb.seed.nome_completo,
        mentor_a_whatsapp=pa.whatsapp,
        mentor_b_whatsapp=pb.whatsapp,
    )
