import { revalidateTag, unstable_cacheTag as cacheTag } from "next/cache";

export function getProblemJobInfoTag(jobInfoId: string) {
  return `problems-jobInfo-${jobInfoId}`;
}

export function getProblemIdTag(id: string) {
  return `problem-${id}`;
}

export function revalidateProblemCache(problem: {
  id: string;
  jobInfoId?: string | null;
}) {
  revalidateTag(getProblemIdTag(problem.id));
  if (problem.jobInfoId) {
    revalidateTag(getProblemJobInfoTag(problem.jobInfoId));
  }
}
