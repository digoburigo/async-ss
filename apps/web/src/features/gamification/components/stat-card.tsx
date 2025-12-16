import { cn } from "@acme/ui";
import { Card, CardContent } from "@acme/ui/base-ui/card";

type StatCardProps = {
  icon: React.ElementType;
  label: string;
  count: number;
  colors: {
    bg: string;
    text: string;
    glow: string;
  };
  delay?: number;
};

export function StatCard({
  icon: Icon,
  label,
  count,
  colors,
  delay = 0,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
        colors.glow
      )}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Background gradient */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-50",
          colors.bg
        )}
      />

      <CardContent className="relative flex items-center gap-4 py-6">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110",
            colors.bg
          )}
        >
          <Icon className={cn("h-7 w-7", colors.text)} />
        </div>

        <div>
          <p className="font-medium text-muted-foreground text-sm">{label}</p>
          <p className="font-bold text-3xl tabular-nums">
            {count.toLocaleString("pt-BR")}
          </p>
        </div>
      </CardContent>

      {/* Hover glow effect */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-1 rounded-xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30",
          colors.bg
        )}
      />
    </Card>
  );
}
