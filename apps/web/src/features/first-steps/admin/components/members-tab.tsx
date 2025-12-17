import { useState } from "react";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { Search, User, Users } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { schema } from "@acme/zen-v3/zenstack/schema";

import { authClient } from "~/clients/auth-client";

export function MembersTab() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const client = useClientQueries(schema);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJobTypeId, setFilterJobTypeId] = useState<string | null>(null);

  // Fetch all job types
  const { data: jobTypes = [] } = client.firstStepsJobType.useFindMany(
    {
      where: { active: true },
      orderBy: { orderIndex: "asc" },
    },
    {
      enabled: !!activeOrganization?.id,
    }
  );

  // Fetch members with their job types
  const { data: members = [], isFetching } = client.member.useFindMany(
    {
      where: {
        organizationId: activeOrganization?.id || "",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        jobType: true,
      },
      orderBy: { createdAt: "desc" },
    },
    {
      enabled: !!activeOrganization?.id,
    }
  );

  const { mutate: updateMember, isPending: isUpdating } =
    client.member.useUpdate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Cargo atualizado com sucesso");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const handleJobTypeChange = (memberId: string, jobTypeId: string | null) => {
    updateMember({
      where: { id: memberId },
      data: { jobTypeId },
    });
  };

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      !searchQuery ||
      member.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesJobType =
      !filterJobTypeId ||
      filterJobTypeId === "all" ||
      (filterJobTypeId === "none" && !member.jobTypeId) ||
      member.jobTypeId === filterJobTypeId;

    return matchesSearch && matchesJobType;
  });

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Membros</h3>
          <p className="text-muted-foreground text-sm">
            Atribua cargos aos membros da organização
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            className="pl-10"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
          />
        </div>
        <Select
          onValueChange={(value) =>
            setFilterJobTypeId(value === "all" ? null : value)
          }
          value={filterJobTypeId || "all"}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cargos</SelectItem>
            <SelectItem value="none">Sem cargo atribuído</SelectItem>
            {jobTypes.map((jobType) => (
              <SelectItem key={jobType.id} value={jobType.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: jobType.color }}
                  />
                  {jobType.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isFetching ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Carregando membros...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="text-muted-foreground mb-4 h-12 w-12" />
            <h4 className="font-medium">Nenhum membro encontrado</h4>
            <p className="text-muted-foreground mt-1 text-center text-sm">
              {searchQuery || filterJobTypeId
                ? "Tente ajustar os filtros de busca."
                : "Não há membros na organização."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        alt={member.user?.name || ""}
                        src={member.user?.image || undefined}
                      />
                      <AvatarFallback>
                        {getInitials(member.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {member.user?.name || "Sem nome"}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        {member.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{member.role}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span>Cargo:</span>
                  </div>
                  <Select
                    disabled={isUpdating}
                    onValueChange={(value) =>
                      handleJobTypeChange(
                        member.id,
                        value === "none" ? null : value
                      )
                    }
                    value={member.jobTypeId || "none"}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum cargo</SelectItem>
                      {jobTypes.map((jobType) => (
                        <SelectItem key={jobType.id} value={jobType.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: jobType.color }}
                            />
                            {jobType.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
