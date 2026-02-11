CREATE TABLE IF NOT EXISTS settings (
  user_id UUID NOT NULL PRIMARY KEY,
  bgm_volume INTEGER NOT NULL DEFAULT 100 CHECK (bgm_volume >= 0 AND bgm_volume <= 100),
  se_volume INTEGER NOT NULL DEFAULT 100 CHECK (se_volume >= 0 AND se_volume <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TRIGGER set_settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
