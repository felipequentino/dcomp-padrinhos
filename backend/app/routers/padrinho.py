import asyncio
import time
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.deps import create_access_token, get_current_padrinho
from app.models import OtpChallenge, Padrinho, PadrinhoSeed
from app.schemas import (
    PadrinhoLookupIn,
    PadrinhoLookupOut,
    PadrinhoProfileIn,
    RequestOtpIn,
    VerifyOtpIn,
    VerifyOtpOut,
)
from app.services.email import send_otp_email
from app.services.otp import generate_otp_code, hash_otp, verify_otp_hash

router = APIRouter(prefix="/api/padrinho", tags=["padrinho"])

_otp_lock = asyncio.Lock()
_last_otp_request: dict[str, float] = {}
OTP_COOLDOWN_SEC = 45
MAX_OTP_ATTEMPTS = 8


def _require_dcomp_email(email: str) -> None:
    if not email.lower().endswith("@dcomp.ufs.br"):
        raise HTTPException(status_code=400, detail="Use um e-mail @dcomp.ufs.br")


@router.post("/lookup", response_model=PadrinhoLookupOut)
async def lookup_padrinho(
    body: PadrinhoLookupIn,
    session: AsyncSession = Depends(get_session),
) -> PadrinhoLookupOut:
    seed = await session.scalar(select(PadrinhoSeed).where(PadrinhoSeed.matricula == body.matricula))
    if seed is None:
        return PadrinhoLookupOut(found=False)
    return PadrinhoLookupOut(
        found=True,
        matricula=seed.matricula,
        nome_completo=seed.nome_completo,
        course=seed.course,
        whatsapp=seed.whatsapp,
        periodo=seed.periodo,
        foi_padrinho_antes=seed.foi_padrinho_antes,
    )


@router.post("/request-otp")
async def request_otp(
    body: RequestOtpIn,
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    _require_dcomp_email(str(body.email))

    seed = await session.scalar(select(PadrinhoSeed).where(PadrinhoSeed.matricula == body.matricula))
    if seed is None:
        raise HTTPException(status_code=404, detail="Matrícula não encontrada nas inscrições")

    other = await session.scalar(select(Padrinho).where(Padrinho.email == str(body.email)))
    if other is not None and other.matricula != body.matricula:
        raise HTTPException(status_code=400, detail="Este e-mail já está vinculado a outra matrícula")

    async with _otp_lock:
        now = time.monotonic()
        last = _last_otp_request.get(body.matricula, 0.0)
        if now - last < OTP_COOLDOWN_SEC:
            raise HTTPException(status_code=429, detail="Aguarde alguns segundos antes de pedir outro código")
        _last_otp_request[body.matricula] = now

    code = generate_otp_code()
    code_hash = hash_otp(code)
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.otp_expire_minutes)

    await session.execute(delete(OtpChallenge).where(OtpChallenge.matricula == body.matricula))
    session.add(
        OtpChallenge(
            matricula=body.matricula,
            pending_email=str(body.email),
            code_hash=code_hash,
            expires_at=expires,
            attempts=0,
        )
    )
    await session.commit()

    try:
        await send_otp_email(str(body.email), code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao enviar e-mail: {e!s}") from e

    return {"detail": "Código enviado para o e-mail informado"}


def settings_otp_expire() -> int:
    from app.config import settings

    return settings.otp_expire_minutes


@router.post("/verify-otp", response_model=VerifyOtpOut)
async def verify_otp(
    body: VerifyOtpIn,
    session: AsyncSession = Depends(get_session),
) -> VerifyOtpOut:
    ch = await session.scalar(
        select(OtpChallenge)
        .where(OtpChallenge.matricula == body.matricula)
        .order_by(OtpChallenge.id.desc())
        .limit(1)
    )
    if ch is None:
        raise HTTPException(status_code=400, detail="Nenhum código pendente para esta matrícula")

    now = datetime.now(timezone.utc)
    exp = ch.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < now:
        raise HTTPException(status_code=400, detail="Código expirado")

    if ch.attempts >= MAX_OTP_ATTEMPTS:
        raise HTTPException(status_code=400, detail="Muitas tentativas. Solicite um novo código")

    if not verify_otp_hash(body.code, ch.code_hash):
        ch.attempts += 1
        await session.commit()
        raise HTTPException(status_code=400, detail="Código incorreto")

    seed = await session.scalar(select(PadrinhoSeed).where(PadrinhoSeed.matricula == body.matricula))
    if seed is None:
        raise HTTPException(status_code=404, detail="Matrícula inválida")

    other = await session.scalar(select(Padrinho).where(Padrinho.email == ch.pending_email))
    if other is not None and other.matricula != body.matricula:
        raise HTTPException(status_code=400, detail="Este e-mail já está vinculado a outra matrícula")

    p = await session.scalar(select(Padrinho).where(Padrinho.matricula == body.matricula))
    if p is None:
        p = Padrinho(
            matricula=body.matricula,
            email=ch.pending_email,
            email_verified=True,
            whatsapp=seed.whatsapp,
        )
        session.add(p)
    else:
        p.email = ch.pending_email
        p.email_verified = True
        p.whatsapp = seed.whatsapp

    await session.execute(delete(OtpChallenge).where(OtpChallenge.matricula == body.matricula))
    await session.commit()

    token = create_access_token(body.matricula)
    return VerifyOtpOut(access_token=token)


@router.put("/profile")
async def update_profile(
    body: PadrinhoProfileIn,
    p: Padrinho = Depends(get_current_padrinho),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(p, k, v)
    await session.commit()
    return {"detail": "Perfil atualizado"}
