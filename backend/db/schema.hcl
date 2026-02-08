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
