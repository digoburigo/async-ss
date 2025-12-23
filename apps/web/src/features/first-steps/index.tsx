import { schema } from "@acme/zen-v3/zenstack/schema";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { useEffect } from "react";

import { authClient } from "~/clients/auth-client";
import { ConfigDrawer } from "~/components/config-drawer";
import { Header } from "~/components/layout/header";
import { Main } from "~/components/layout/main";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { Search } from "~/components/search";
import { ThemeSwitch } from "~/components/theme-switch";
import {
  FirstStepsProvider,
  useFirstSteps,
} from "./components/first-steps-provider";
import { FirstStepsTabs } from "./components/first-steps-tabs";
import { JobTypeSelector } from "./components/job-type-selector";
import { NoJobTypeMessage } from "./components/no-job-type-message";
import { StepsListSkeleton } from "./components/steps-list-skeleton";

function FirstStepsContent() {
  const { data: session } = authClient.useSession();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const { selectedJobTypeId, setSelectedJobTypeId } = useFirstSteps();

  const client = useClientQueries(schema);

  // Get the user's member record to check role and jobTypeId
  const { data: members = [] } = client.member.useFindMany(
    {
      where: {
        userId: session?.user?.id || "",
        organizationId: activeOrganization?.id || "",
      },
    },
    {
      enabled: !!session?.user?.id && !!activeOrganization?.id,
    }
  );

  const currentMember = members[0];

  // Check if user is org admin
  const isOrgAdmin =
    currentMember?.role === "admin" || currentMember?.role === "owner";

  // Get member's job type
  const memberJobTypeId = currentMember?.jobTypeId;

  // Determine which job type to use for display
  const effectiveJobTypeId = isOrgAdmin
    ? selectedJobTypeId || memberJobTypeId
    : memberJobTypeId;

  // Fetch all job types (for admin selector)
  const { data: jobTypes = [] } = client.firstStepsJobType.useFindMany(
    {
      where: { active: true },
      orderBy: { orderIndex: "asc" },
    },
    {
      enabled: !!activeOrganization?.id,
    }
  );

  // Set initial selected job type for admins
  useEffect(() => {
    if (isOrgAdmin && !selectedJobTypeId && memberJobTypeId) {
      setSelectedJobTypeId(memberJobTypeId);
    }
  }, [isOrgAdmin, selectedJobTypeId, memberJobTypeId, setSelectedJobTypeId]);

  // Fetch steps for the effective job type
  const { data: steps = [], isLoading: isLoadingSteps } =
    client.firstStepsItem.useFindMany(
      {
        where: {
          jobTypeId: effectiveJobTypeId || "",
          active: true,
        },
        include: {
          progress: true,
        },
        orderBy: { orderIndex: "asc" },
      },
      {
        enabled: !!effectiveJobTypeId && !!activeOrganization?.id,
      }
    );

  // Fetch quiz for the effective job type
  const { data: quizzes = [] } = client.firstStepsQuiz.useFindMany(
    {
      where: {
        jobTypeId: effectiveJobTypeId || "",
        active: true,
      },
      include: {
        questions: {
          where: { active: true },
          orderBy: { orderIndex: "asc" },
        },
        attempts: true,
      },
    },
    {
      enabled: !!effectiveJobTypeId && !!activeOrganization?.id,
    }
  );

  const quiz = quizzes[0] || null;
  const userId = session?.user?.id || "";

  // Show loading state only on initial load (not on background refetches)
  if (isLoadingSteps) {
    return <StepsListSkeleton />;
  }

  // Show message if no job type assigned and not admin
  if (!(effectiveJobTypeId || isOrgAdmin)) {
    return <NoJobTypeMessage isOrgAdmin={false} />;
  }

  return (
    <div className="space-y-6">
      {isOrgAdmin && jobTypes.length > 0 ? (
        <JobTypeSelector
          jobTypes={jobTypes}
          onSelect={setSelectedJobTypeId}
          selectedJobTypeId={selectedJobTypeId}
        />
      ) : null}

      {!effectiveJobTypeId && isOrgAdmin ? (
        <NoJobTypeMessage isOrgAdmin />
      ) : (
        <FirstStepsTabs
          hasQuiz={!!quiz}
          quiz={quiz}
          steps={steps}
          userId={userId}
        />
      )}
    </div>
  );
}

export function FirstSteps() {
  return (
    <FirstStepsProvider>
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
            <h2 className="font-bold text-2xl tracking-tight">
              Primeiros Passos
            </h2>
            <p className="text-muted-foreground">
              Complete os passos abaixo para se familiarizar com a empresa.
            </p>
          </div>
        </div>
        <FirstStepsContent />
      </Main>
    </FirstStepsProvider>
  );
}
