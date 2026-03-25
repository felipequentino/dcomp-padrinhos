from email.message import EmailMessage

import aiosmtplib

from app.config import settings


async def send_plain_email(to_addrs: list[str], subject: str, body: str) -> None:
    if not settings.email_username or not settings.email_password:
        raise RuntimeError("EMAIL_USERNAME e EMAIL_PASSWORD devem estar configurados no .env")

    msg = EmailMessage()
    msg["From"] = settings.email_from or settings.email_username
    msg["To"] = ", ".join(to_addrs)
    msg["Subject"] = subject
    msg.set_content(body)

    await aiosmtplib.send(
        msg,
        hostname=settings.smtp_host,
        port=settings.smtp_port,
        username=settings.email_username,
        password=settings.email_password,
        start_tls=settings.smtp_use_tls,
    )


async def send_otp_email(to_email: str, code: str) -> None:
    body = (
        f"Seu código de verificação para o cadastro de padrinho/madrinha SAC DCOMP é: {code}\n\n"
        "Ele expira em alguns minutos. Se você não solicitou, ignore este e-mail."
    )
    await send_plain_email([to_email], "Código de verificação SAC DCOMP", body)


async def send_freshman_chose_pair_email(
    to_email: str,
    mentor_name: str,
    freshman_name: str,
    freshman_phone: str,
    freshman_matricula: str,
    freshman_course: str,
) -> None:
    body = (
        f"Olá, {mentor_name},\n\n"
        f"Um calouro escolheu a sua dupla de padrinhos.\n\n"
        f"Nome: {freshman_name}\n"
        f"Matrícula: {freshman_matricula}\n"
        f"Curso (informado): {freshman_course}\n"
        f"Telefone: {freshman_phone}\n\n"
        "Por favor, entre em contato com o calouro o quanto antes.\n\n"
        "— Sistema de Apadrinhamento DCOMP"
    )
    await send_plain_email([to_email], "Calouro escolheu você como padrinho/madrinha", body)
