import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class PadrinhoSeed(Base):
    __tablename__ = "padrinho_seed"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    matricula: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    nome_completo: Mapped[str] = mapped_column(String(512))
    course: Mapped[str] = mapped_column(String(8))
    whatsapp: Mapped[str] = mapped_column(String(64))
    periodo: Mapped[str | None] = mapped_column(String(64), nullable=True)
    foi_padrinho_antes: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    motivation_text: Mapped[str] = mapped_column(Text, default="")
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Padrinho(Base):
    __tablename__ = "padrinho"

    matricula: Mapped[str] = mapped_column(String(32), ForeignKey("padrinho_seed.matricula"), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    whatsapp: Mapped[str] = mapped_column(String(64))

    hobby: Mapped[str | None] = mapped_column(String(512), nullable=True)
    music_artist: Mapped[str | None] = mapped_column(String(512), nullable=True)
    computing_area: Mapped[str | None] = mapped_column(String(512), nullable=True)
    celebrity: Mapped[str | None] = mapped_column(String(512), nullable=True)
    dream_destination: Mapped[str | None] = mapped_column(String(512), nullable=True)
    favorite_series: Mapped[str | None] = mapped_column(String(512), nullable=True)
    personal_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    seed: Mapped["PadrinhoSeed"] = relationship()


class OtpChallenge(Base):
    __tablename__ = "otp_challenge"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    matricula: Mapped[str] = mapped_column(String(32), ForeignKey("padrinho_seed.matricula"), index=True)
    pending_email: Mapped[str] = mapped_column(String(255))
    code_hash: Mapped[str] = mapped_column(String(128))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    attempts: Mapped[int] = mapped_column(Integer, default=0)


class MentorPair(Base):
    __tablename__ = "mentor_pair"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mentor_a_matricula: Mapped[str] = mapped_column(String(32), ForeignKey("padrinho.matricula"))
    mentor_b_matricula: Mapped[str] = mapped_column(String(32), ForeignKey("padrinho.matricula"))
    course: Mapped[str] = mapped_column(String(8), index=True)
    max_slots: Mapped[int] = mapped_column(Integer, default=4)
    whatsapp_group_link: Mapped[str | None] = mapped_column(String(2048), nullable=True)


class FreshmanSelection(Base):
    __tablename__ = "freshman_selection"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    freshman_matricula: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(512))
    phone: Mapped[str] = mapped_column(String(64))
    course: Mapped[str] = mapped_column(String(8))
    terms_accepted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    pair_id: Mapped[str] = mapped_column(String(36), ForeignKey("mentor_pair.id"))

    pair: Mapped["MentorPair"] = relationship()
