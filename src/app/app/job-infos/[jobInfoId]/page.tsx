import { BackLink } from "@/components/BackLink";
import { Skeleton } from "@/components/Skeleton";
import { SuspendedItem } from "@/components/SuspendedItem";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { formatExperienceLevel } from "@/features/jobInfos/lib/formatters";
import { GenerateJobDescriptionButton } from "@/features/jobInfos/components/GenerateJobDescriptionButton";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import {
  MapPinIcon,
  DollarSignIcon,
  BriefcaseBusinessIcon,
} from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";

export default async function JobInfoPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  const jobInfo = getCurrentUser().then(
    async ({ userId, redirectToSignIn }) => {
      if (userId == null) return redirectToSignIn();

      const jobInfo = await getJobInfo(jobInfoId, userId);
      if (jobInfo == null) return notFound();

      return jobInfo;
    }
  );

  return (
    <div className="container my-4 space-y-4">
      <BackLink href="/app">Dashboard</BackLink>

      <div className="space-y-6">
        {/* Header Card */}
        <header className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <SuspendedItem
                      item={jobInfo}
                      fallback={<Skeleton className="w-48 h-10" />}
                      result={(j) => (
                        <CardTitle className="text-3xl font-bold">
                          {j.name}
                        </CardTitle>
                      )}
                    />
                    <SuspendedItem
                      item={jobInfo}
                      fallback={null}
                      result={(j) =>
                        j.title ? (
                          <p className="text-lg text-muted-foreground">
                            {j.title}
                          </p>
                        ) : null
                      }
                    />
                  </div>
                </div>

                {/* Info Boxes Grid */}
                <SuspendedItem
                  item={jobInfo}
                  fallback={<Skeleton className="w-full h-24" />}
                  result={(j) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {j.salary && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <DollarSignIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">
                              Salary
                            </p>
                            <p className="text-sm font-semibold">{j.salary}</p>
                          </div>
                        </div>
                      )}
                      {j.location && (
                        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <MapPinIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">
                              Location
                            </p>
                            <p className="text-sm font-semibold">
                              {j.location}
                            </p>
                          </div>
                        </div>
                      )}
                      <div
                        className={
                          j.experienceLevel === "junior"
                            ? "flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                            : j.experienceLevel === "mid-level"
                            ? "flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                            : "flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                        }
                      >
                        <BriefcaseBusinessIcon
                          className={
                            j.experienceLevel === "junior"
                              ? "h-5 w-5 text-blue-600 dark:text-blue-400"
                              : j.experienceLevel === "mid-level"
                              ? "h-5 w-5 text-yellow-600 dark:text-yellow-400"
                              : "h-5 w-5 text-red-600 dark:text-red-400"
                          }
                        />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">
                            Experience
                          </p>
                          <p className="text-sm font-semibold">
                            {formatExperienceLevel(j.experienceLevel)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                />

                {/* Tags */}
                <SuspendedItem
                  item={jobInfo}
                  fallback={null}
                  result={(j) => {
                    if (!j.tags || j.tags.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {j.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    );
                  }}
                />
              </div>
            </CardHeader>
          </Card>
        </header>

        {/* AI Generated Content or Fallback */}
        <SuspendedItem
          item={jobInfo}
          fallback={<Skeleton className="w-full h-64" />}
          result={(j) => {
            const hasAiContent =
              j.isAiProcessed && j.aiJobDescription && j.aiRequirements;

            if (hasAiContent) {
              return (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold">
                        Job Description
                      </CardTitle>
                      <GenerateJobDescriptionButton
                        jobInfoId={j.id}
                        isAiProcessed={j.isAiProcessed || false}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Job Description Section */}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {j.aiJobDescription
                        ?.split("\n\n")
                        .map((paragraph, idx) => (
                          <p
                            key={idx}
                            className="mb-3 last:mb-0 text-muted-foreground"
                          >
                            {paragraph}
                          </p>
                        ))}
                    </div>

                    {/* Requirements Section */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold">Requirements</h3>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="space-y-1">
                          {j.aiRequirements?.split("\n").map((req, idx) => (
                            <p key={idx} className="ml-0 text-muted-foreground">
                              {req}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // Fallback to original description
            return (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">
                      Description
                    </CardTitle>
                    <GenerateJobDescriptionButton
                      jobInfoId={j.id}
                      isAiProcessed={j.isAiProcessed || false}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {j.description}
                  </p>
                </CardContent>
              </Card>
            );
          }}
        />
      </div>
    </div>
  );
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
