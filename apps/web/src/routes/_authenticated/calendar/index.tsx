import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { ConfigDrawer } from "~/components/config-drawer";
import { Header } from "~/components/layout/header";
import { Main } from "~/components/layout/main";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { Search } from "~/components/search";
import { ThemeSwitch } from "~/components/theme-switch";
import { Calendar } from "~/features/calendar";

export const Route = createFileRoute("/_authenticated/calendar/")({
  component: RouteComponent,
});

export default function RouteComponent() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              Carregando calendário...
            </div>
          }
        >
          <Calendar />
        </Suspense>
      </Main>
    </>
  );
}
