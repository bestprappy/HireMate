import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  MapPinIcon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobInfoUserTag } from "@/features/jobInfos/dbCache";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobInfoForm } from "@/features/jobInfos/components/JobInfoForm";
import { formatExperienceLevel } from "@/features/jobInfos/lib/formatters";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { JobCard } from "@/features/jobInfos/components/JobCard";

// --- Page shell ---
export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="container my-8">
          <Header />
          <SkeletonGrid />
        </div>
      }
    >
      <JobInfos />
    </Suspense>
  );
}

function Header() {
  return (
    <div className="flex items-start justify-between gap-3 mb-6">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl lg:text-5xl">
          Select a job description
        </h1>
        <p className="text-lg text-muted-foreground mt-4">
          Choose a job to practice interviews tailored to its specifics.
        </p>
      </div>
      <Button asChild>
        <Link href="/app/job-infos/new" aria-label="Create job description">
          <PlusIcon className="size-4" />
          Create job description
        </Link>
      </Button>
    </div>
  );
}

async function JobInfos() {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const jobInfos = await getJobInfos(userId);

  if (jobInfos.length === 0) {
    return <NoJobInfos />;
  }

  return (
    <div className="container my-8">
      <Header />

      {/* Optional: search/sort bar could live here */}

      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobInfos.map((job) => (
          <li key={job.id}>
            <Link
              href={`/app/job-infos/${job.id}`}
              aria-label={`Open ${job.name}`}
            >
              <JobCard job={job} />
            </Link>
          </li>
        ))}

        {/* New tile */}
        <li>
          <Card className="h-full border-dashed shadow-none ">
            <Link
              href="/app/job-infos/new"
              className="h-full flex items-center justify-center p-6 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
              aria-label="Create job description"
            >
              <PlusIcon className="size-5" aria-hidden="true" />
              <span className="ml-2">Create job description</span>
            </Link>
          </Card>
        </li>
      </ul>
    </div>
  );
}

function NoJobInfos() {
  return (
    <div className="container my-8 max-w-5xl">
      <h1 className="text-3xl md:text-4xl lg:text-5xl mb-3">
        Welcome to HireMate
      </h1>
      <p className="text-muted-foreground mb-6">
        Start by describing the job you’re targeting. Specifics (stack, role,
        seniority) help us generate interviews that feel real.
      </p>
      <Card>
        <CardContent className="pt-6">
          <JobInfoForm />
        </CardContent>
      </Card>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="animate-pulse">
          <div className="h-40 rounded-xl bg-muted" />
        </li>
      ))}
    </ul>
  );
}

async function getJobInfos(userId: string) {
  "use cache";
  cacheTag(getJobInfoUserTag(userId));
  return db.query.JobInfoTable.findMany({
    where: eq(JobInfoTable.userId, userId),
    orderBy: desc(JobInfoTable.updatedAt),
  });
}
