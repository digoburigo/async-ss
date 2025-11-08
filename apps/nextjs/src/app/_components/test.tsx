"use client";

import { useQuery } from "@tanstack/react-query";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";

import { schema } from "@acme/zen-v3/zenstack/schema";

import { useTRPC } from "~/trpc/react";

export function Test() {
  const client = useClientQueries(schema);
  const { data, error } = client.post.useFindMany();
  console.log("🚀 -> data:", data);
  console.log(`🚀 -> error:`, error);

  const trpc = useTRPC();
  const { data: sqlData } = useQuery(trpc.post.sql.queryOptions());
  const { data: posts } = useQuery(trpc.post.all.queryOptions());
  console.log(`🚀 -> posts:`, posts);
  console.log("🚀 -> sqlData:", sqlData);

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return <div>TestClient</div>;
}
