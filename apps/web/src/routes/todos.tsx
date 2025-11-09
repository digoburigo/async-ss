import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { toast } from "sonner";

import { Button } from "@acme/ui/button";
import { schema } from "@acme/zen-v3/zenstack/schema";

import { authClient } from "~/clients/auth-client";
import { TodoCreate } from "~/components/todos/todo-create";
import { TodoList } from "~/components/todos/todo-list";

export const Route = createFileRoute("/todos")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data, error } = await authClient.getSession();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });

  const { data: orgs } = useQuery({
    queryKey: ["orgs"],
    queryFn: async () => {
      const response = await authClient.organization.list(
        {
          query: {
            limit: 100,
          },
        },
        {
          throw: true,
        },
      );

      return response;
    },
  });

  const { data: activeOrganization, isPending: isLoadingActiveOrganization } =
    authClient.useActiveOrganization();

  const client = useClientQueries(schema);

  const { data: todos, isFetching: isFetchingTodos } = client.todo.useFindMany(
    {},
    {
      enabled: !!activeOrganization?.id,
    },
  );

  return (
    <div>
      <p>{session?.user?.email}</p>
      <ul>
        {orgs?.map((org) => (
          <li key={org.id}>
            {org.name} ({org.id})
            <Button
              onClick={() => {
                authClient.organization
                  .setActive({
                    organizationId: org.id,
                  })
                  .then(() => {
                    toast.success("Organization selected");
                  })
                  .catch((error) => {
                    toast.error(error.message);
                  });
              }}
            >
              Select
            </Button>
          </li>
        ))}
      </ul>
      {isLoadingActiveOrganization ? (
        <p>Loading active organization...</p>
      ) : null}
      {!isLoadingActiveOrganization && activeOrganization ? (
        <p>{activeOrganization?.name}</p>
      ) : null}

      <TodoCreate />

      {isFetchingTodos ? <p>Loading todos...</p> : null}
      {!isFetchingTodos && todos && todos?.length === 0 ? (
        <p>No todos found</p>
      ) : null}
      {!isFetchingTodos && todos && todos.length > 0 ? (
        <TodoList todos={todos} />
      ) : null}
    </div>
  );
}
