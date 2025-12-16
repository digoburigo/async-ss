import type { Session } from "@acme/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@acme/ui/sidebar";
import { useNavigate } from "@tanstack/react-router";
import {
  BellIcon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  LogOutIcon,
  MoonIcon,
  SettingsIcon,
  SparklesIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

import { authClient } from "~/clients/auth-client";

export function UserMenu({
  user,
}: Readonly<{
  user: Session["user"];
}>) {
  const { isMobile } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate({ href: "/auth/login" });
  };

  const getUserInitials = () => {
    if (!user.name) return "U";
    const parts = user.name.split(" ");
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage
                  alt={user.name ?? "User"}
                  referrerPolicy="no-referrer"
                  src={user.image ?? ""}
                />
                <AvatarFallback className="rounded-lg text-xs">
                  {getUserInitials()} aa
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4 shrink-0 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage
                    alt={user.name ?? "User"}
                    referrerPolicy="no-referrer"
                    src={user.image ?? ""}
                  />
                  <AvatarFallback className="rounded-lg text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-muted-foreground text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <SparklesIcon className="size-4 text-muted-foreground" />
                <span className="flex-1">Upgrade to Pro</span>
                <Badge className="ml-auto text-xs" variant="secondary">
                  New
                </Badge>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <UserIcon className="size-4 text-muted-foreground" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <CreditCardIcon className="size-4 text-muted-foreground" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <BellIcon className="size-4 text-muted-foreground" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <SettingsIcon className="size-4 text-muted-foreground" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={(e) => {
                e.preventDefault();
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
              }}
            >
              {resolvedTheme === "dark" ? (
                <MoonIcon className="size-4 text-muted-foreground" />
              ) : (
                <SunIcon className="size-4 text-muted-foreground" />
              )}
              <span>Toggle theme</span>
              <span className="ml-auto text-muted-foreground text-xs">
                {resolvedTheme === "dark" ? "Dark" : "Light"}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOutIcon className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
