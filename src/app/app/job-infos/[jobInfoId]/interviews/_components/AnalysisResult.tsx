"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2Icon } from "lucide-react";

type CategoryAnalysis = {
  score: number;
  summary: string;
  feedback?: string[];
};

type AIAnalysis = {
  overall?: CategoryAnalysis;
  ATS?: CategoryAnalysis;
  ats?: CategoryAnalysis;
  jobMatch?: CategoryAnalysis;
  writing?: CategoryAnalysis;
  keywords?: CategoryAnalysis;
  [key: string]: CategoryAnalysis | undefined;
};

export function AnalysisResults({
  aiAnalysis,
  isLoading,
}: {
  aiAnalysis: AIAnalysis | null;
  isLoading: boolean;
}) {
  if (!aiAnalysis && !isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2Icon className="animate-spin size-8 mx-auto" />
            <p className="text-gray-600">Analyzing your resume with AI...</p>
            <p className="text-sm text-gray-500">
              This may take a minute or two
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!aiAnalysis) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800";
    if (score >= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      {aiAnalysis.overall && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Assessment</span>
              <Badge
                className={`text-lg px-3 py-1 ${getScoreColor(
                  aiAnalysis.overall.score
                )}`}
              >
                {aiAnalysis.overall.score}/10 -{" "}
                {getScoreLabel(aiAnalysis.overall.score)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{aiAnalysis.overall.summary}</p>
            {aiAnalysis.overall.feedback && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Key Points:</h4>
                <ul className="space-y-2">
                  {aiAnalysis.overall.feedback.map(
                    (item: string, idx: number) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-700 flex gap-2"
                      >
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Individual Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: "ATS", label: "ATS Optimization" },
          { key: "jobMatch", label: "Job Match" },
          { key: "writing", label: "Writing Quality" },
          { key: "keywords", label: "Keywords & Skills" },
        ].map(({ key, label }) => {
          const category = aiAnalysis[key.toLowerCase()] || aiAnalysis[key];
          if (!category) return null;

          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{label}</span>
                  <Badge className={`${getScoreColor(category.score)}`}>
                    {category.score}/10
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">{category.summary}</p>
                {category.feedback && category.feedback.length > 0 && (
                  <div className="space-y-2">
                    <ul className="space-y-1">
                      {category.feedback.map((item: string, idx: number) => (
                        <li
                          key={idx}
                          className="text-xs text-gray-600 flex gap-2"
                        >
                          <span className="text-gray-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommendations Section */}
      {aiAnalysis.overall?.feedback &&
        aiAnalysis.overall.feedback.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base">Top Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 list-decimal list-inside">
                {aiAnalysis.overall.feedback
                  .slice(0, 5)
                  .map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700">
                      {item}
                    </li>
                  ))}
              </ol>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
