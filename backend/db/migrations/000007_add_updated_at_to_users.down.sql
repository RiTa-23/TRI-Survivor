DROP TRIGGER IF EXISTS update_users_updated_at ON users;
ALTER TABLE users DROP COLUMN IF EXISTS updated_at;
