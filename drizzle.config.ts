import type { Config } from "drizzle-kit";
export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: {
    host: import.meta.env["DATABASE_HOST"]!,
    user: import.meta.env["DATABASE_USERNAME"]!,
    password: import.meta.env["DATABASE_PASSWORD"]!,
    database: import.meta.env["DATABASE_NAME"]!,
  }


} satisfies Config;