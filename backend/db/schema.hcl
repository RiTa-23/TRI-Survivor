schema "public" {
  comment = "Standard public schema"
}

table "users" {
  schema = schema.public
  column "id" {
    null = false
    type = uuid
    // Supabase Auth ID (UUID) is used as PK
  }
  column "email" {
    null = false
    type = text
  }
  column "name" {
    null = false
    type = text
  }
  column "avatar_url" {
    null = true
    type = text
  }
  column "created_at" {
    null = false
    type = timestamptz
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  unique "email" {
    columns = [column.email]
  }
}

table "settings" {
  schema = schema.public
  column "user_id" {
    null = false
    type = uuid
  }
  column "bgm_volume" {
    null = false
    type = integer
    default = 100
    check "bgm_volume_range" {
      expr = "bgm_volume >= 0 AND bgm_volume <= 100"
    }
  }
  column "se_volume" {
    null = false
    type = integer
    default = 100
    check "se_volume_range" {
      expr = "se_volume >= 0 AND se_volume <= 100"
    }
  }
  column "created_at" {
    null = false
    type = timestamptz
    default = sql("now()")
  }
  column "updated_at" {
    null = false
    type = timestamptz
    default = sql("now()")
  }
  
  primary_key {
    columns = [column.user_id]
  }

  foreign_key "user_fk" {
    columns     = [column.user_id]
    ref_columns = [table.users.column.id]
    on_delete   = CASCADE
  }
}

table "shop" {
  schema = schema.public
  column "item_id" {
    null = false
    type = integer
    identity {
      generated = ALWAYS
    }
  }
  column "item_name" {
    null = false
    type = text
  }
  column "description" {
    null = false
    type = text
  }
  column "price" {
    null = false
    type = integer
  }
  column "item_type" {
    null = false
    type = text
  }
  column "icon_url" {
    null = false
    type = text
  }
  column "is_active" {
    null    = false
    type    = boolean
    default = true
  }
  column "created_at" {
    null    = false
    type    = timestamptz
    default = sql("now()")
  }
  column "updated_at" {
    null    = false
    type    = timestamptz
    default = sql("now()")
  }
  primary_key {
    columns = [column.item_id]
  }
}

