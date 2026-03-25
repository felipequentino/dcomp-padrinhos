from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./sac.db"
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_expire_minutes: int = 60 * 24 * 7

    forms_csv_path: str = "../frontend/forms.csv"
    # POST /api/admin/import-forms — cabeçalho X-Import-Secret; vazio => 503
    import_forms_secret: str = ""

    cors_origins: str = "http://localhost:5173"

    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_use_tls: bool = True
    email_username: str = ""
    email_password: str = ""
    email_from: str = ""

    otp_expire_minutes: int = 15
    otp_pepper: str = "dev-otp-pepper"


settings = Settings()
