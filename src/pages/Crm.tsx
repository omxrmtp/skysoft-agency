import { useState } from "react";
import { CrmShell } from "@/components/crm/CrmShell";
import { DashboardView } from "@/components/crm/DashboardView";
import { ProjectsView } from "@/components/crm/ProjectsView";
import { LeadsView } from "@/components/crm/LeadsView";

type View = "dashboard" | "projects" | "leads";

const Crm = () => {
  const [view, setView] = useState<View>("dashboard");

  return (
    <CrmShell view={view} onChange={setView}>
      {view === "dashboard" && <DashboardView />}
      {view === "projects" && <ProjectsView />}
      {view === "leads" && <LeadsView />}
    </CrmShell>
  );
};

export default Crm;
