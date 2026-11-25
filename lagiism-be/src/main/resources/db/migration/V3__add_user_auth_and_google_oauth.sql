-- ==============================================================================
-- V3__add_user_auth_and_google_oauth.sql
-- Adds Google OAuth2 fields & customer USER support on unified accounts table
-- ==============================================================================

ALTER TABLE admin_accounts ADD COLUMN auth_provider VARCHAR(32) NOT NULL DEFAULT 'LOCAL';
ALTER TABLE admin_accounts ADD COLUMN google_sub VARCHAR(128);
ALTER TABLE admin_accounts ADD COLUMN avatar_url TEXT;
ALTER TABLE admin_accounts ALTER COLUMN password_hash DROP NOT NULL;

CREATE UNIQUE INDEX idx_admin_accounts_google_sub ON admin_accounts (google_sub);
