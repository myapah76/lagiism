-- ==============================================================================
-- V6__support_guest_and_admin_orders.sql
-- Allows guest / Instagram non-user orders (nullable user_id) and tracks source & payment
-- ==============================================================================

ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ADD COLUMN order_source VARCHAR(32) NOT NULL DEFAULT 'WEBSITE';
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(32) NOT NULL DEFAULT 'COD';
