import { Button } from "@acme/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { authClient } from "~/clients/auth-client";
import { ConfigDrawer } from "~/components/config-drawer";
import { Header } from "~/components/layout/header";
import { Main } from "~/components/layout/main";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { Search } from "~/components/search";
import { ThemeSwitch } from "~/components/theme-switch";
import { AdminDialogs } from "./components/admin-dialogs";
import { AdminProvider } from "./components/admin-provider";
import { AdminTabs } from "./components/admin-tabs";

function AdminContent() {
  const { data: session } = authClient.useSession();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: activeMember } = authClient.useActiveMember();

  // Check if user is org admin
  const isOrgAdmin =
    activeMember?.role === "admin" || activeMember?.role === "owner";

  if (!(session && activeOrganization)) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!isOrgAdmin) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
        <h2 className="font-semibold text-xl">Acesso Negado</h2>
        <p className="text-muted-foreground">
          Você não tem permissão para acessar esta página.
        </p>
        <Button asChild variant="outline">
          <Link to="/primeiro-passos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Primeiros Passos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminTabs />
      <AdminDialogs />
    </div>
  );
}

export function FirstStepsAdmin() {
  return (
    <AdminProvider>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <Button asChild className="mb-2" size="sm" variant="ghost">
              <Link to="/primeiro-passos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <h2 className="font-bold text-2xl tracking-tight">
              Primeiros Passos - Administração
            </h2>
            <p className="text-muted-foreground">
              Configure os passos de onboarding para cada cargo.
            </p>
          </div>
        </div>
        <AdminContent />
      </Main>
    </AdminProvider>
  );
}
