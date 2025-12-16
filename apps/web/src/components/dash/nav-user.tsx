"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
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
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useNavigate } from "@tanstack/react-router";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import {
  Bell,
  CreditCard,
  LogOut,
  Moon,
  MoreVertical,
  Sun,
  Trophy,
  UserCircle,
} from "lucide-react";
import { useTheme } from "next-themes";

import { authClient } from "~/clients/auth-client";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = authClient.useSession();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const client = useClientQueries(schema);

  const { data: userScore } = client.userScore.useFindFirst(
    {
      where: { userId: session?.user?.id },
    },
    {
      enabled: !!activeOrganization?.id && !!session?.user?.id,
    }
  );

  const totalPoints = userScore?.totalPoints ?? 0;

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
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  src={user.avatar}
                />
                <AvatarFallback className="rounded-lg text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {user.email}
                </span>
                {totalPoints > 0 && (
                  <span className="flex items-center gap-1 text-amber-500 text-xs">
                    <Trophy className="h-3 w-3" />
                    {totalPoints.toLocaleString("pt-BR")} pts
                  </span>
                )}
              </div>
              <MoreVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    src={user.avatar}
                  />
                  <AvatarFallback className="rounded-lg text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-muted-foreground text-xs">
                    {user.email}
                  </span>
                  {totalPoints > 0 && (
                    <span className="flex items-center gap-1 text-amber-500 text-xs">
                      <Trophy className="h-3 w-3" />
                      {totalPoints.toLocaleString("pt-BR")} pts
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserCircle />
                Conta
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Cobrança
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notificações
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
              }}
            >
              {resolvedTheme === "dark" ? <Moon /> : <Sun />}
              <span>Alternar tema</span>
              <span className="ml-auto text-muted-foreground text-xs">
                {resolvedTheme === "dark" ? "Escuro" : "Claro"}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
