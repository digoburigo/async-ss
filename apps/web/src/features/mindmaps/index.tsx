import { ConfigDrawer } from "~/components/config-drawer";
import { Header } from "~/components/layout/header";
import { Main } from "~/components/layout/main";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { Search } from "~/components/search";
import { ThemeSwitch } from "~/components/theme-switch";
import { MindmapsDialogs } from "./components/mindmaps-dialogs";
import { MindmapsList } from "./components/mindmaps-list";
import { MindmapsProvider } from "./components/mindmaps-provider";

export function Mindmaps() {
	return (
		<MindmapsProvider>
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
						<h2 className="text-2xl font-bold tracking-tight">Mapas Mentais</h2>
						<p className="text-muted-foreground">
							Visualize e organize os fluxos de trabalho da empresa
						</p>
					</div>
				</div>
				<MindmapsList />
			</Main>

			<MindmapsDialogs />
		</MindmapsProvider>
	);
}
