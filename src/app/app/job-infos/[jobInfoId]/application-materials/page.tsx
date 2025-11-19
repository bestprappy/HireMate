import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink";
import { ApplicationMaterialsClient } from "@/features/jobInfos/components/ApplicationMaterialsClient";
import { Suspense } from "react";
import { Loader2Icon } from "lucide-react";

export default async function ApplicationMaterialsPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  return (
    <div className="container py-4 space-y-4">
      <JobInfoBackLink jobInfoId={jobInfoId} />
      <Suspense
        fallback={<Loader2Icon className="animate-spin size-24 m-auto" />}
      >
        <ApplicationMaterialsClient jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
}
