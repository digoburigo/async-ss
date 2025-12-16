"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@acme/ui/sidebar";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export function NavMain({
  items,
  currentPath,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
  currentPath?: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              item.url === "/"
                ? currentPath === "/"
                : currentPath?.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <Link
                    activeOptions={
                      item.url === "/" ? { exact: true } : undefined
                    }
                    to={item.url}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
