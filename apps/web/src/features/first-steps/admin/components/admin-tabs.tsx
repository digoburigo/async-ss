import { Briefcase, FileText, HelpCircle, Users } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import { JobTypesTab } from "./job-types-tab";
import { MembersTab } from "./members-tab";
import { QuizAdminTab } from "./quiz-admin-tab";
import { StepsTab } from "./steps-tab";

export function AdminTabs() {
  return (
    <Tabs className="w-full" defaultValue="job-types">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger className="flex items-center gap-2" value="job-types">
          <Briefcase className="h-4 w-4" />
          <span className="hidden sm:inline">Cargos</span>
        </TabsTrigger>
        <TabsTrigger className="flex items-center gap-2" value="steps">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Passos</span>
        </TabsTrigger>
        <TabsTrigger className="flex items-center gap-2" value="quiz">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Quiz</span>
        </TabsTrigger>
        <TabsTrigger className="flex items-center gap-2" value="members">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Membros</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent className="mt-6" value="job-types">
        <JobTypesTab />
      </TabsContent>

      <TabsContent className="mt-6" value="steps">
        <StepsTab />
      </TabsContent>

      <TabsContent className="mt-6" value="quiz">
        <QuizAdminTab />
      </TabsContent>

      <TabsContent className="mt-6" value="members">
        <MembersTab />
      </TabsContent>
    </Tabs>
  );
}
