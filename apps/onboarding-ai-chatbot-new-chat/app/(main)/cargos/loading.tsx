import { Skeleton } from "@/components/ui/skeleton";

export default function CargosLoading() {
	return (
		<div className="flex-1 p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<Skeleton className="h-8 w-48 mb-2" />
					<Skeleton className="h-4 w-64" />
				</div>
				<Skeleton className="h-10 w-32" />
			</div>
			<Skeleton className="h-10 w-64 mb-6" />
			<div className="space-y-2">
				{[1, 2, 3, 4, 5].map((i) => (
					<Skeleton key={i} className="h-16 w-full" />
				))}
			</div>
		</div>
	);
}
