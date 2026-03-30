-- =============================================================================
-- SAC DCOMP — Postgres: zerar TUDO (incluindo planilha no banco)
-- =============================================================================
-- Apaga também padrinho_seed. Depois é obrigatório rodar de novo a importação
-- do CSV (POST /api/admin/import-forms ou python -m app.scripts.import_forms).
--
-- Uso:
--   psql "$DATABASE_URL" -f scripts/reset_postgres_full_then_reimport_csv.sql
-- =============================================================================

BEGIN;

TRUNCATE TABLE
    freshman_selection,
    mentor_pair,
    otp_challenge,
    padrinho,
    padrinho_seed
RESTART IDENTITY;

COMMIT;
