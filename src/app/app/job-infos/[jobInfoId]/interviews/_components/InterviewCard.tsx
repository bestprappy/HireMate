"use client";

import { InterviewTable } from "@/drizzle/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function InterviewCard({
  interview,
  jobInfoId,
}: {
  interview: typeof InterviewTable.$inferSelect;
  jobInfoId: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Interview -{" "}
            {formatDistanceToNow(new Date(interview.createdAt), {
              addSuffix: true,
            })}
          </CardTitle>
          {interview.feedback && (
            <Badge variant="outline" className="bg-green-50">
              Feedback Generated
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {interview.feedback && (
          <>
            <div>
              <h3 className="font-semibold mb-2">Interview Feedback</h3>
              <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                <MarkdownRenderer>{interview.feedback}</MarkdownRenderer>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button asChild size="sm">
                <Link
                  href={`/app/job-infos/${jobInfoId}/resume?interviewId=${interview.id}`}
                >
                  Improve Resume Based on Feedback
                </Link>
              </Button>
            </div>
          </>
        )}

        {!interview.feedback && (
          <p className="text-sm text-gray-500">
            Feedback is being generated. Please check back in a moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
