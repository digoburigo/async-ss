import { cn } from "@acme/ui";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@acme/ui/base-ui/sidebar";
import { Button } from "@acme/ui/button";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

export function AppTitle() {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          className="gap-0 py-0 hover:bg-transparent active:bg-transparent"
          size="lg"
        >
          <div>
            <Link
              className="grid flex-1 text-start text-sm leading-tight"
              onClick={() => setOpenMobile(false)}
              to="/"
            >
              <span className="truncate font-bold">Shadcn-Admin</span>
              <span className="truncate text-xs">Vite + ShadcnUI</span>
            </Link>
            <ToggleSidebar />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function ToggleSidebar({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      className={cn("aspect-square size-8 max-md:scale-125", className)}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      size="icon"
      variant="ghost"
      {...props}
    >
      <X className="md:hidden" />
      <Menu className="max-md:hidden" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
