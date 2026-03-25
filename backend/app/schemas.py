import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


class PadrinhoLookupIn(BaseModel):
    matricula: str = Field(min_length=1, max_length=32)

    @field_validator("matricula", mode="before")
    @classmethod
    def norm_matricula(cls, v: str) -> str:
        s = str(v).strip()
        return "".join(c for c in s if c.isdigit()) or s


class PadrinhoLookupOut(BaseModel):
    found: bool
    matricula: str | None = None
    nome_completo: str | None = None
    course: str | None = None
    whatsapp: str | None = None
    periodo: str | None = None
    foi_padrinho_antes: bool | None = None


class RequestOtpIn(BaseModel):
    matricula: str = Field(min_length=1, max_length=32)
    email: EmailStr

    @field_validator("matricula", mode="before")
    @classmethod
    def norm_matricula(cls, v: str) -> str:
        s = str(v).strip()
        return "".join(c for c in s if c.isdigit()) or s

    @field_validator("email", mode="before")
    @classmethod
    def lower_email(cls, v: str) -> str:
        return str(v).strip().lower()

    @field_validator("email", mode="after")
    @classmethod
    def must_be_dcomp(cls, v: EmailStr) -> EmailStr:
        s = str(v).lower()
        if not s.endswith("@dcomp.ufs.br"):
            raise ValueError("Use um e-mail @dcomp.ufs.br")
        return v


class VerifyOtpIn(BaseModel):
    matricula: str
    code: str = Field(min_length=5, max_length=5)

    @field_validator("matricula", mode="before")
    @classmethod
    def norm_matricula(cls, v: str) -> str:
        s = str(v).strip()
        return "".join(c for c in s if c.isdigit()) or s

    @field_validator("code", mode="before")
    @classmethod
    def digits_only(cls, v: str) -> str:
        return "".join(c for c in str(v) if c.isdigit())[:5]


class VerifyOtpOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PadrinhoProfileIn(BaseModel):
    hobby: str | None = None
    music_artist: str | None = None
    computing_area: str | None = None
    celebrity: str | None = None
    dream_destination: str | None = None
    favorite_series: str | None = None
    personal_description: str | None = None
    photo_url: str | None = None
    whatsapp: str | None = None


class MentorPublic(BaseModel):
    name: str
    matricula: str
    music_artist: str | None
    computing_area: str | None
    celebrity: str | None
    dream_destination: str | None
    hobby: str | None
    favorite_series: str | None
    personal_description: str | None
    photo_url: str | None
    whatsapp: str


class PairOut(BaseModel):
    id: str
    course: str
    available_slots: int
    max_slots: int
    whatsapp_group_link: str | None
    mentors: list[MentorPublic]


class FreshmanRegisterIn(BaseModel):
    freshman_matricula: str
    name: str = Field(max_length=512)
    phone: str = Field(max_length=64)
    course: str = Field(pattern="^(CC|SI|EC)$")
    terms_accepted: bool
    pair_id: str

    @field_validator("freshman_matricula", mode="before")
    @classmethod
    def norm_freshman_matricula(cls, v: str) -> str:
        s = str(v).strip()
        return "".join(c for c in s if c.isdigit()) or s

    @field_validator("freshman_matricula", mode="after")
    @classmethod
    def validate_freshman_matricula(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 12:
            raise ValueError("Matrícula deve ter exatamente 12 dígitos (ex.: 202600059820).")
        if not v.startswith("2026"):
            raise ValueError("Matrícula deve começar com 2026.")
        return v

    @field_validator("name", mode="before")
    @classmethod
    def norm_calouro_name(cls, v: str) -> str:
        return " ".join(str(v).strip().split())

    @field_validator("name", mode="after")
    @classmethod
    def validate_calouro_name(cls, v: str) -> str:
        if len(v) < 4:
            raise ValueError("Informe um nome válido.")
        parts = v.split()
        if len(parts) < 2:
            raise ValueError("Informe o nome completo (nome e sobrenome).")
        for p in parts:
            if len(p) < 2:
                raise ValueError("Cada parte do nome deve ter pelo menos 2 letras.")
        if any(ch.isdigit() for ch in v):
            raise ValueError("O nome não deve conter números.")
        if not re.fullmatch(
            r"[A-Za-zÀ-ÿ\u00C0-\u017F][A-Za-zÀ-ÿ\u00C0-\u017F\s'.-]*",
            v,
        ):
            raise ValueError("Use apenas letras, espaços, hífen ou apóstrofo no nome.")
        return v

    @field_validator("phone", mode="before")
    @classmethod
    def norm_calouro_phone(cls, v: str) -> str:
        return str(v).strip()

    @field_validator("phone", mode="after")
    @classmethod
    def validate_calouro_phone(cls, v: str) -> str:
        digits = "".join(c for c in v if c.isdigit())
        if not digits:
            raise ValueError("Informe um telefone ou WhatsApp.")
        if digits.startswith("55"):
            if not (12 <= len(digits) <= 13):
                raise ValueError("Com código do país (55), use 12 ou 13 dígitos.")
        elif not (10 <= len(digits) <= 11):
            raise ValueError("Informe DDD + número (10 ou 11 dígitos) ou inclua o 55 no início.")
        return v


class FreshmanRegisterOut(BaseModel):
    pair_id: str
    mentor_a_name: str
    mentor_b_name: str
    mentor_a_whatsapp: str
    mentor_b_whatsapp: str
    message: str = "Entre em contato com seus padrinhos pelos números abaixo."
