import { db, reset, schema } from "@repo/db";

async function main() {
  await reset(db, schema);
}

main();
