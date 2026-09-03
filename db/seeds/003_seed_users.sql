-- Seed demo users for the workshop bookmark feature (simple demo auth).

BEGIN;

INSERT INTO users (id, username, display_name) VALUES
  ('22222222-2222-2222-2222-222222222001', 'sari', 'Sari Lestari'),
  ('22222222-2222-2222-2222-222222222002', 'budi', 'Budi Santoso')
ON CONFLICT (username) DO NOTHING;

COMMIT;
