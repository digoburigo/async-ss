import { ConfigDrawer } from "~/components/config-drawer";
import { Header } from "~/components/layout/header";
import { Main } from "~/components/layout/main";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { Search } from "~/components/search";
import { ThemeSwitch } from "~/components/theme-switch";
import { BoardsList } from "./components/boards-list";
import { KanbanDialogs } from "./components/kanban-dialogs";
import { KanbanPrimaryButtons } from "./components/kanban-primary-buttons";
import { KanbanProvider } from "./components/kanban-provider";

export function KanbanBoards() {
  return (
    <KanbanProvider>
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
            <h2 className="font-bold text-2xl tracking-tight">
              Quadros Kanban
            </h2>
            <p className="text-muted-foreground">
              Organize suas tarefas em quadros visuais.
            </p>
          </div>
          <KanbanPrimaryButtons />
        </div>
        <BoardsList />
      </Main>

      <KanbanDialogs />
    </KanbanProvider>
  );
}
