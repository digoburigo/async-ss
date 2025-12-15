import { ConfigDrawer } from "~/components/config-drawer";
import { Header } from "~/components/layout/header";
import { Main } from "~/components/layout/main";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { Search } from "~/components/search";
import { ThemeSwitch } from "~/components/theme-switch";
import { CalendarProvider } from "./components/calendar-provider";

export function Calendar() {
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

			<Main className="flex flex-1 flex-col">
				<div className="mb-6">
					<h2 className="text-2xl font-bold tracking-tight">Calendário</h2>
					<p className="text-muted-foreground">
						Gerencie seus eventos e compromissos
					</p>
				</div>
				<CalendarProvider />
			</Main>
		</>
	);
}
