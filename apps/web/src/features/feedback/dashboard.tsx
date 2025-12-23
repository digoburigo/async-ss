import { Badge } from "@acme/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  MessageSquare,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { ConfigDrawer } from "~/components/config-drawer";
import { Header } from "~/components/layout/header";
import { Main } from "~/components/layout/main";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { Search } from "~/components/search";
import { ThemeSwitch } from "~/components/theme-switch";
import { getStatusOption } from "./data/data";

export function FeedbackDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["feedback-stats"],
    queryFn: async () => {
      const { api } = await import("~/clients/api-client");
      const response = await api.feedback.stats.get();
      return response.data;
    },
  });

  if (isLoading) {
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
        <Main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </Main>
      </>
    );
  }

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

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div>
          <h2 className="font-bold text-2xl tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visao geral dos feedbacks e reclamacoes.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Total</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{stats?.total ?? 0}</div>
              <p className="text-muted-foreground text-xs">
                feedbacks registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Abertos</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-blue-500">
                {stats?.open ?? 0}
              </div>
              <p className="text-muted-foreground text-xs">
                aguardando atendimento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Em Andamento
              </CardTitle>
              <Loader2 className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-yellow-500">
                {stats?.inProgress ?? 0}
              </div>
              <p className="text-muted-foreground text-xs">sendo trabalhados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Resolvidos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-green-500">
                {stats?.resolved ?? 0}
              </div>
              <p className="text-muted-foreground text-xs">solucionados</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Em Revisao</CardTitle>
              <Eye className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {stats?.underReview ?? 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                SLA Atrasado
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-red-500">
                {stats?.slaBreached ?? 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Tempo Medio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {stats?.avgResolutionTime
                  ? `${Math.round(stats.avgResolutionTime)}h`
                  : "-"}
              </div>
              <p className="text-muted-foreground text-xs">para resolucao</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* By Category */}
          <Card>
            <CardHeader>
              <CardTitle>Por Categoria</CardTitle>
              <CardDescription>
                Distribuicao dos feedbacks por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.byCategory && stats.byCategory.length > 0 ? (
                <div className="space-y-3">
                  {stats.byCategory.map((item: any) => (
                    <div
                      className="flex items-center justify-between"
                      key={item.categoryName}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.categoryColor }}
                        />
                        <span className="text-sm">{item.categoryName}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhum dado disponivel
                </p>
              )}
            </CardContent>
          </Card>

          {/* By Department */}
          <Card>
            <CardHeader>
              <CardTitle>Por Departamento</CardTitle>
              <CardDescription>
                Distribuicao dos feedbacks por departamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.byDepartment && stats.byDepartment.length > 0 ? (
                <div className="space-y-3">
                  {stats.byDepartment.map((item: any) => (
                    <div
                      className="flex items-center justify-between"
                      key={item.departmentName}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.departmentColor }}
                        />
                        <span className="text-sm">{item.departmentName}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhum dado disponivel
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Ultimas atualizacoes de status</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((item: any) => {
                  const toStatusOpt = getStatusOption(item.toStatus);
                  return (
                    <div className="flex items-start gap-3" key={item.id}>
                      <div className="mt-1">
                        {toStatusOpt?.value === "resolved" && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {toStatusOpt?.value === "rejected" && (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        {toStatusOpt?.value === "in_progress" && (
                          <Loader2 className="h-4 w-4 text-yellow-500" />
                        )}
                        {!["resolved", "rejected", "in_progress"].includes(
                          toStatusOpt?.value ?? ""
                        ) && (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          <span className="font-mono text-xs">
                            {item.referenceNumber}
                          </span>
                          {" - "}
                          <span className="font-medium">
                            {item.feedbackTitle}
                          </span>
                        </p>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <Badge className="text-xs" variant="outline">
                            {toStatusOpt?.label}
                          </Badge>
                          {item.userName && <span>por {item.userName}</span>}
                          <span>
                            {format(new Date(item.createdAt), "dd/MM HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhuma atividade recente
              </p>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  );
}
