import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/base-ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@acme/ui/base-ui/sidebar";
import { Skeleton } from "@acme/ui/base-ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Building2Icon, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "~/clients/auth-client";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { data: activeOrganization, isPending: isLoadingActiveOrganization } =
    authClient.useActiveOrganization();

  const { data: organizations, isPending: isLoadingOrganizations } =
    authClient.useListOrganizations();

  const handleSelectOrganization = async (organizationId: string) => {
    try {
      await authClient.organization.setActive({
        organizationId,
      });
      toast.success("Organization switched successfully");
      // Refresh the browser to refetch all queries
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to switch organization"
      );
    }
  };

  if (isLoadingActiveOrganization || isLoadingOrganizations) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                size="lg"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2Icon className="size-4" />
            </div>
            <div className="grid flex-1 text-start text-sm leading-tight">
              <span className="truncate font-semibold">
                {activeOrganization?.name ?? "Select organization"}
              </span>
              <span className="truncate text-xs">
                {organizations?.length ?? 0} organization
                {organizations?.length !== 1 ? "s" : ""}
              </span>
            </div>
            <ChevronsUpDown className="ms-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Organizations
              </DropdownMenuLabel>
              {organizations?.map((org) => (
                <DropdownMenuItem
                  className="cursor-pointer gap-2 p-2"
                  key={org.id}
                  onClick={() => {
                    handleSelectOrganization(org.id);
                  }}
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Building2Icon className="size-4 shrink-0" />
                  </div>
                  {org.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              render={<Link to="/organizations" />}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Manage organizations
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
