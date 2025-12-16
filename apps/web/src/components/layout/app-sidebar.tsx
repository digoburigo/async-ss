import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@acme/ui/base-ui/sidebar";

import { authClient } from "~/clients/auth-client";
import { useLayout } from "~/context/layout-provider";
// import { AppTitle } from './app-title'
import { sidebarData } from "./data/sidebar-data";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

export function AppSidebar() {
  const { collapsible, variant } = useLayout();

  const { data: session } = authClient.useSession();

  const user = session?.user
    ? {
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
        avatar: session.user.image ?? "",
      }
    : {
        name: "User",
        email: "",
        avatar: "",
      };

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>{session?.user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
