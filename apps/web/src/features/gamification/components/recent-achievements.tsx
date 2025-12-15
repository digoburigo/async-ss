import { cn } from "@acme/ui";
import { Badge } from "@acme/ui/base-ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@acme/ui/base-ui/card";
import { Sparkles, Trophy } from "lucide-react";

import { MILESTONE_COLORS, MILESTONE_ICONS } from "../index";

type Achievement = {
	id: string;
	name: string;
	description: string;
	points: number;
	milestoneType: string;
	icon: string | null;
	earnedAt: Date;
};

type RecentAchievementsProps = {
	achievements: Achievement[];
};

export function RecentAchievements({ achievements }: RecentAchievementsProps) {
	return (
		<Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5">
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20">
						<Sparkles className="h-5 w-5 text-emerald-500" />
					</div>
					<div>
						<CardTitle>Conquistas Recentes</CardTitle>
						<CardDescription>Seus últimos objetivos alcançados</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{achievements.map((achievement, index) => {
						const Icon = MILESTONE_ICONS[achievement.milestoneType] || Trophy;
						const colors =
							MILESTONE_COLORS[achievement.milestoneType] ||
							MILESTONE_COLORS.onboarding;
						return (
							<div
								key={achievement.id}
								className="group flex items-center gap-4 rounded-lg bg-white/50 p-4 transition-all duration-200 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10"
								style={{
									animationDelay: `${index * 100}ms`,
								}}
							>
								<div
									className={cn(
										"flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110",
										colors.bg,
									)}
								>
									<Icon className={cn("h-6 w-6", colors.text)} />
								</div>

								<div className="flex-1">
									<div className="flex items-center gap-2">
										<p className="font-semibold">{achievement.name}</p>
										<Badge
											variant="secondary"
											className="bg-amber-500/10 text-amber-600 dark:text-amber-400"
										>
											+{achievement.points} pts
										</Badge>
									</div>
									<p className="text-muted-foreground text-sm">
										{achievement.description}
									</p>
								</div>

								<div className="text-muted-foreground text-right text-xs">
									{new Date(achievement.earnedAt).toLocaleDateString("pt-BR", {
										day: "numeric",
										month: "short",
									})}
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
