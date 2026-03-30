-- =============================================================================
-- SAC DCOMP — Postgres: zerar cadastros e uso, MANTER só os dados da planilha
-- =============================================================================
-- Remove:
--   - escolhas de calouros (freshman_selection)
--   - duplas formadas (mentor_pair)
--   - OTPs pendentes (otp_challenge)
--   - padrinhos já cadastrados na plataforma (padrinho)
--
-- MANTÉM:
--   - padrinho_seed (linhas importadas do CSV / forms)
--
-- Depois disso os padrinhos podem refazer login + perfil; você precisa rodar de
-- novo o pareamento (script pair_mentors ou equivalente).
--
-- Uso (exemplo):
--   psql "$DATABASE_URL" -f scripts/reset_postgres_keep_spreadsheet.sql
--   ou: psql -h ... -U ... -d ... -f scripts/reset_postgres_keep_spreadsheet.sql
-- =============================================================================

BEGIN;

TRUNCATE TABLE
    freshman_selection,
    mentor_pair,
    otp_challenge,
    padrinho
RESTART IDENTITY;

COMMIT;

-- Verificação rápida (opcional):
-- SELECT 'padrinho_seed' AS t, COUNT(*) FROM padrinho_seed
-- UNION ALL SELECT 'padrinho', COUNT(*) FROM padrinho
-- UNION ALL SELECT 'mentor_pair', COUNT(*) FROM mentor_pair
-- UNION ALL SELECT 'freshman_selection', COUNT(*) FROM freshman_selection;
