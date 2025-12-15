import { Card, CardContent } from "@acme/ui/base-ui/card";
import { Award, Flame, Sparkles, Star, Trophy, Zap } from "lucide-react";

type PointsHeroProps = {
	totalPoints: number;
	achievementsEarned: number;
	totalAchievements: number;
};

export function PointsHero({
	totalPoints,
	achievementsEarned,
	totalAchievements,
}: PointsHeroProps) {
	const level = Math.floor(totalPoints / 100) + 1;
	const progressToNextLevel = totalPoints % 100;

	return (
		<Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10">
			{/* Decorative elements */}
			<div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
			<div className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-yellow-500/10 blur-xl" />

			<CardContent className="relative py-8">
				<div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
					{/* Points Display */}
					<div className="flex items-center gap-6">
						<div className="relative">
							<div className="absolute inset-0 animate-pulse rounded-full bg-amber-500/20 blur-xl" />
							<div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
								<Trophy className="h-12 w-12 text-white drop-shadow-lg" />
							</div>
							<div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white shadow-lg">
								{level}
							</div>
						</div>

						<div className="text-center md:text-left">
							<p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
								Pontos Totais
							</p>
							<p className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-5xl font-black tabular-nums text-transparent">
								{totalPoints.toLocaleString("pt-BR")}
							</p>
							<div className="mt-2 flex items-center gap-2">
								<Zap className="h-4 w-4 text-amber-500" />
								<span className="text-muted-foreground text-sm">
									Nível {level} • {progressToNextLevel}/100 para o próximo
								</span>
							</div>
						</div>
					</div>

					{/* Stats */}
					<div className="flex gap-6">
						<div className="flex flex-col items-center gap-2 rounded-xl bg-white/50 p-4 dark:bg-white/5">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/20 to-green-500/20">
								<Award className="h-6 w-6 text-emerald-500" />
							</div>
							<div className="text-center">
								<p className="text-2xl font-bold">
									{achievementsEarned}/{totalAchievements}
								</p>
								<p className="text-muted-foreground text-xs">Conquistas</p>
							</div>
						</div>

						<div className="flex flex-col items-center gap-2 rounded-xl bg-white/50 p-4 dark:bg-white/5">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400/20 to-red-500/20">
								<Flame className="h-6 w-6 text-orange-500" />
							</div>
							<div className="text-center">
								<p className="text-2xl font-bold">{level}</p>
								<p className="text-muted-foreground text-xs">Nível Atual</p>
							</div>
						</div>

						<div className="flex flex-col items-center gap-2 rounded-xl bg-white/50 p-4 dark:bg-white/5">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400/20 to-purple-500/20">
								<Star className="h-6 w-6 text-violet-500" />
							</div>
							<div className="text-center">
								<p className="text-2xl font-bold">
									{Math.round((achievementsEarned / totalAchievements) * 100) ||
										0}
									%
								</p>
								<p className="text-muted-foreground text-xs">Completo</p>
							</div>
						</div>
					</div>
				</div>

				{/* Level Progress Bar */}
				<div className="mt-6">
					<div className="h-2 w-full overflow-hidden rounded-full bg-amber-500/10">
						<div
							className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-out"
							style={{ width: `${progressToNextLevel}%` }}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
