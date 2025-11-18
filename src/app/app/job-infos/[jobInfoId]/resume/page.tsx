import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { canRunResumeAnalysis } from "@/features/resumeAnalyses/permissions";
import { JobInfoBackLink } from "../_components/JobInfoBackLink";
import { ResumePageClient } from "./_client";

export const metadata = {
  title: "Resume Analysis",
};

export default async function ResumePage({
  params,
  searchParams,
}: {
  params: Promise<{ jobInfoId: string }>;
  searchParams: Promise<{ interviewId?: string }>;
}) {
  const { jobInfoId } = await params;
  const { interviewId } = await searchParams;

  return (
    <div className="container py-4 space-y-4 h-screen-header flex flex-col items-start">
      <JobInfoBackLink jobInfoId={jobInfoId} />
      <Suspense
        fallback={<Loader2Icon className="animate-spin size-24 m-auto" />}
      >
        <SuspendedComponent jobInfoId={jobInfoId} interviewId={interviewId} />
      </Suspense>
    </div>
  );
}

async function SuspendedComponent({
  jobInfoId,
  interviewId,
}: {
  jobInfoId: string;
  interviewId?: string;
}) {
  if (!(await canRunResumeAnalysis())) return redirect("/app/upgrade");

  return <ResumePageClient jobInfoId={jobInfoId} interviewId={interviewId} />;
}
