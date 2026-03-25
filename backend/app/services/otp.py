import hashlib
import secrets

from app.config import settings


def generate_otp_code() -> str:
    n = secrets.randbelow(100_000)
    return f"{n:05d}"


def hash_otp(code: str) -> str:
    raw = f"{code}:{settings.otp_pepper}".encode()
    return hashlib.sha256(raw).hexdigest()


def verify_otp_hash(code: str, code_hash: str) -> bool:
    return secrets.compare_digest(hash_otp(code), code_hash)
