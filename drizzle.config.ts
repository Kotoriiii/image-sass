import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

const path =
  process.env.NODE_ENV === "development"
    ? ".env.development"
    : ".env.production";

dotenv.config({ path });

export default defineConfig({
  schema: "src/app/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL!,
  },
  verbose: true,
  strict: true,
});
