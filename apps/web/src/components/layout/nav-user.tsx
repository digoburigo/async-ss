import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/base-ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@acme/ui/base-ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@acme/ui/base-ui/sidebar";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { Link, useNavigate } from "@tanstack/react-router";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import {
	BadgeCheck,
	Bell,
	Building2Icon,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Sparkles,
	Trophy,
} from "lucide-react";

import { authClient } from "~/clients/auth-client";
import { SignOutDialog } from "~/components/sign-out-dialog";
import useDialogState from "~/hooks/use-dialog-state";

type NavUserProps = {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
};

export function NavUser({ user }: NavUserProps) {
	const { isMobile } = useSidebar();
	const [open, setOpen] = useDialogState();
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const { data: activeOrganization } = authClient.useActiveOrganization();
	const client = useClientQueries(schema);

	const { data: userScore } = client.userScore.useFindFirst(
		{
			where: { userId: session?.user?.id },
		},
		{
			enabled: !!activeOrganization?.id && !!session?.user?.id,
		},
	);

	const totalPoints = userScore?.totalPoints ?? 0;

	const getUserInitials = () => {
		if (!user.name) return "U";
		const parts = user.name.split(" ");
		return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
	};

	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								/>
							}
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.avatar} alt={user.name} />
								<AvatarFallback className="rounded-lg">
									{getUserInitials()}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-start text-sm leading-tight">
								<span className="truncate font-semibold">{user.name}</span>
								{/* <span className="truncate text-xs">{user.email}</span> */}
								{totalPoints > 0 && (
									<span className="flex items-center gap-1 text-xs">
										<Trophy className="h-3 w-3" />
										{totalPoints.toLocaleString("pt-BR")} pts
									</span>
								)}
							</div>
							<ChevronsUpDown className="ms-auto size-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
							side={isMobile ? "bottom" : "right"}
							align="end"
							sideOffset={4}
						>
							<DropdownMenuGroup>
								<DropdownMenuLabel className="p-0 font-normal">
									<div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
										<Avatar className="h-8 w-8 rounded-lg">
											<AvatarImage src={user.avatar} alt={user.name} />
											<AvatarFallback className="rounded-lg">
												{getUserInitials()}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-start text-sm leading-tight">
											<span className="truncate font-semibold">
												{user.name}
											</span>
											<span title={user.email} className="truncate text-xs">
												{user.email}
											</span>
											{totalPoints > 0 && (
												<span className="flex items-center gap-1 text-xs">
													<Trophy className="h-3 w-3" />
													{totalPoints.toLocaleString("pt-BR")} pts
												</span>
											)}
										</div>
									</div>
								</DropdownMenuLabel>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem render={<Link to="/organizations" />}>
									<Building2Icon />
									Organizations
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem>
									<Sparkles />
									Upgrade to Pro
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem render={<Link to="/settings/account" />}>
									<BadgeCheck />
									Account
								</DropdownMenuItem>
								<DropdownMenuItem render={<Link to="/settings" />}>
									<CreditCard />
									Billing
								</DropdownMenuItem>
								<DropdownMenuItem
									render={<Link to="/settings/notifications" />}
								>
									<Bell />
									Notifications
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								variant="destructive"
								onClick={async () => {
									await authClient.signOut();
									navigate({ to: "/auth/login" });
								}}
							>
								<LogOut />
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>

			<SignOutDialog open={!!open} onOpenChange={setOpen} />
		</>
	);
}
