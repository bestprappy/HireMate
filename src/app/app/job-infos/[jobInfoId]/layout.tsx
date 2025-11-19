import { JobInfoSidebar } from "@/features/jobInfos/components/JobInfoSidebar";
import { use } from "react";

export default function JobInfoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = use(params);

  return (
    <div className="flex h-screen overflow-hidden">
      <JobInfoSidebar jobInfoId={jobInfoId} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
