import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as relations from "./relations";

const connectionString = process.env.DATABASE_URL;

const client = connectionString
  ? postgres(connectionString, { prepare: false })
  : (null as unknown as ReturnType<typeof postgres>);

export const db = connectionString
  ? drizzle(client, { schema: { ...schema, ...relations } })
  : new Proxy({} as ReturnType<typeof drizzle>, {
      get() {
        throw new Error(
          "DATABASE_URL environment variable is not set. See .env.example for required variables."
        );
      },
    });
