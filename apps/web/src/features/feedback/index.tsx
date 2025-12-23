import { ConfigDrawer } from "~/components/config-drawer";
import { Header } from "~/components/layout/header";
import { Main } from "~/components/layout/main";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { Search } from "~/components/search";
import { ThemeSwitch } from "~/components/theme-switch";
import { FeedbackDialogs } from "./components/feedback-dialogs";
import { FeedbackPrimaryButtons } from "./components/feedback-primary-buttons";
import { FeedbackProvider } from "./components/feedback-provider";
import { FeedbackTable } from "./components/feedback-table";

export function Feedback() {
  return (
    <FeedbackProvider>
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
            <h2 className="font-bold text-2xl tracking-tight">Feedbacks</h2>
            <p className="text-muted-foreground">
              Gerencie os feedbacks e reclamacoes dos cidadaos.
            </p>
          </div>
          <FeedbackPrimaryButtons />
        </div>
        <FeedbackTable />
      </Main>

      <FeedbackDialogs />
    </FeedbackProvider>
  );
}
