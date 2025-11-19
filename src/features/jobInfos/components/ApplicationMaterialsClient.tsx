"use client";

// cspell:ignore Customizer
import { Skeleton } from "@/components/Skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { applicationMaterialsSchema } from "@/services/ai/applicationMaterials/schemas";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { DeepPartial } from "ai";
import {
  FileTextIcon,
  LinkedinIcon,
  MailIcon,
  SparklesIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  LightbulbIcon,
  CopyIcon,
  RefreshCwIcon,
} from "lucide-react";
import { toast } from "sonner";
import z from "zod";
import { useEffect, useState } from "react";

type ApplicationMaterialsSuggestions = z.infer<
  typeof applicationMaterialsSchema
>;
type PartialApplicationMaterialsSuggestions =
  DeepPartial<ApplicationMaterialsSuggestions>;
type PartialResumeBulletPoint = DeepPartial<
  ApplicationMaterialsSuggestions["resumeBulletPoints"][number]
>;
type PartialKeyword = DeepPartial<
  ApplicationMaterialsSuggestions["keywordsToAdd"][number]
>;
type PartialCoverLetterPoint = DeepPartial<
  ApplicationMaterialsSuggestions["coverLetterPoints"][number]
>;
type PartialLinkedInOptimization = DeepPartial<
  ApplicationMaterialsSuggestions["linkedInOptimization"]
>;

export function ApplicationMaterialsClient({
  jobInfoId,
}: {
  jobInfoId: string;
}) {
  const [existingSuggestions, setExistingSuggestions] =
    useState<PartialApplicationMaterialsSuggestions | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);

  const {
    object: suggestions,
    isLoading,
    error,
    submit: generateSuggestions,
  } = useObject<PartialApplicationMaterialsSuggestions>({
    api: "/api/ai/application-materials",
    schema: applicationMaterialsSchema,
    fetch: (url, options) => {
      console.log("Sending request with jobInfoId:", jobInfoId);
      return fetch(url, {
        ...options,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobInfoId }),
      });
    },
    onFinish: ({ object }) => {
      console.log("Finished generating:", object);
      if (object) {
        setExistingSuggestions(object);
        toast.success("Suggestions saved successfully!");
      }
    },
    onError: (error) => {
      console.error("Error generating suggestions:", error);
      toast.error("Failed to generate suggestions. Please try again.");
    },
  });

  useEffect(() => {
    async function loadExistingSuggestions() {
      setIsLoadingExisting(true);
      try {
        const response = await fetch(
          `/api/application-materials/${jobInfoId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setExistingSuggestions(
            (data?.suggestions ??
              null) as PartialApplicationMaterialsSuggestions | null
          );
        } else {
          console.error(
            "Failed to load application materials:",
            response.status,
            response.statusText
          );
        }
      } catch (fetchError) {
        console.error("Error loading application materials:", fetchError);
      } finally {
        setIsLoadingExisting(false);
      }
    }

    loadExistingSuggestions();
  }, [jobInfoId]);

  const handleGenerate = () => {
    console.log("Generate button clicked");
    generateSuggestions(undefined);
  };

  const displaySuggestions: PartialApplicationMaterialsSuggestions | null =
    suggestions || existingSuggestions;
  const resumeBulletPoints = displaySuggestions?.resumeBulletPoints as
    | PartialResumeBulletPoint[]
    | undefined;
  const keywordsToAdd = displaySuggestions?.keywordsToAdd as
    | PartialKeyword[]
    | undefined;
  const coverLetterPoints = displaySuggestions?.coverLetterPoints as
    | PartialCoverLetterPoint[]
    | undefined;
  const linkedInOptimization = displaySuggestions?.linkedInOptimization as
    | PartialLinkedInOptimization
    | undefined;
  const showGenerateButton =
    !displaySuggestions && !isLoading && !isLoadingExisting;

  return (
    <div className="space-y-6 w-full">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-primary" />
                Application Materials Customizer
              </CardTitle>
              <CardDescription>
                Get AI-powered suggestions to optimize your resume, cover
                letter, and LinkedIn profile for this specific job
              </CardDescription>
            </div>
            {displaySuggestions && !isLoading && (
              <Button
                onClick={handleGenerate}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                    Regenerate
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">Error: {error.message}</p>
            </div>
          )}
          {showGenerateButton && (
            <Button onClick={handleGenerate} size="lg" className="w-full">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Generate Custom Suggestions
            </Button>
          )}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <LoadingSwap isLoading={true} loadingIconClassName="size-12">
                <div />
              </LoadingSwap>
              <p className="text-sm text-muted-foreground">
                Analyzing job requirements and generating personalized
                suggestions...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Strategy */}
      {(displaySuggestions?.overallStrategy || isLoading) && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LightbulbIcon className="h-5 w-5 text-primary" />
              Overall Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displaySuggestions?.overallStrategy ? (
              <p className="text-muted-foreground leading-relaxed">
                {displaySuggestions.overallStrategy}
              </p>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resume Bullet Points */}
      {(displaySuggestions?.resumeBulletPoints || isLoading) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="h-5 w-5" />
              Resume Bullet Points
            </CardTitle>
            <CardDescription>
              Key points to emphasize or add to your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading && !resumeBulletPoints ? (
                <>
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </>
              ) : (
                resumeBulletPoints?.map((item, idx) => (
                  <ResumeBulletItem key={idx} {...item} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keywords to Add */}
      {(displaySuggestions?.keywordsToAdd || isLoading) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5" />
              Keywords to Add
            </CardTitle>
            <CardDescription>
              Important keywords for ATS optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading && !displaySuggestions?.keywordsToAdd ? (
                <>
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </>
              ) : (
                <>
                  {keywordsToAdd && keywordsToAdd.length > 0 && (
                    <KeywordsList keywords={keywordsToAdd} />
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cover Letter Points */}
      {(displaySuggestions?.coverLetterPoints || isLoading) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MailIcon className="h-5 w-5" />
              Cover Letter Points
            </CardTitle>
            <CardDescription>
              Key points to include in your cover letter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="opening">
                <AccordionTrigger>Opening</AccordionTrigger>
                <AccordionContent>
                  <CoverLetterSection
                    points={coverLetterPoints?.filter(
                      (point) => point?.section === "opening"
                    )}
                    isLoading={isLoading}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="body">
                <AccordionTrigger>Body</AccordionTrigger>
                <AccordionContent>
                  <CoverLetterSection
                    points={coverLetterPoints?.filter(
                      (point) => point?.section === "body"
                    )}
                    isLoading={isLoading}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="closing">
                <AccordionTrigger>Closing</AccordionTrigger>
                <AccordionContent>
                  <CoverLetterSection
                    points={coverLetterPoints?.filter(
                      (point) => point?.section === "closing"
                    )}
                    isLoading={isLoading}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* LinkedIn Optimization */}
      {(displaySuggestions?.linkedInOptimization || isLoading) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkedinIcon className="h-5 w-5" />
              LinkedIn Optimization
            </CardTitle>
            <CardDescription>
              Optimize your LinkedIn profile for this role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Headline */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                Headline
              </h4>
              {linkedInOptimization?.headline ? (
                <div className="p-4 bg-muted rounded-lg relative group">
                  <p className="text-sm pr-8">
                    {linkedInOptimization.headline}
                  </p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        linkedInOptimization?.headline || ""
                      );
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Skeleton className="h-16" />
              )}
            </div>

            {/* About Section */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                About Section
              </h4>
              {linkedInOptimization?.about ? (
                <div className="p-4 bg-muted rounded-lg space-y-2 relative group">
                  {linkedInOptimization.about.map((line, idx) => (
                    <p key={idx} className="text-sm">
                      {line}
                    </p>
                  ))}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        linkedInOptimization?.about?.join("\n\n") || ""
                      );
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Skeleton className="h-24" />
              )}
            </div>

            {/* Skills to Highlight */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                Skills to Highlight
              </h4>
              {linkedInOptimization?.skillsToHighlight ? (
                <div className="flex flex-wrap gap-2">
                  {linkedInOptimization.skillsToHighlight.map((skill, idx) => (
                    <Badge key={idx} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResumeBulletItem({
  suggestion,
  reasoning,
  priority,
}: PartialResumeBulletPoint) {
  if (!suggestion || !reasoning || !priority) return null;

  const priorityConfig = {
    high: {
      icon: CheckCircle2Icon,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
      label: "High Priority",
    },
    medium: {
      icon: AlertCircleIcon,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
      label: "Medium Priority",
    },
    low: {
      icon: LightbulbIcon,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      label: "Nice to Have",
    },
  };

  const priorityKey = priority as keyof typeof priorityConfig;
  const config = priorityConfig[priorityKey];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <div className={`p-4 border rounded-lg space-y-2 ${config.bg}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 ${config.color} flex-shrink-0`} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {config.label}
            </Badge>
          </div>
          <p className="font-medium">{suggestion}</p>
          <p className="text-sm text-muted-foreground">{reasoning}</p>
        </div>
      </div>
    </div>
  );
}

function KeywordsList({ keywords }: { keywords: PartialKeyword[] }) {
  const grouped = keywords.reduce<Record<string, PartialKeyword[]>>(
    (acc, kw) => {
      if (!kw?.category) return acc;
      if (!acc[kw.category]) acc[kw.category] = [];
      acc[kw.category].push(kw);
      return acc;
    },
    {}
  );

  const importanceColors = {
    critical: "border-red-500/50 bg-red-500/10",
    important: "border-yellow-500/50 bg-yellow-500/10",
    "nice-to-have": "border-blue-500/50 bg-blue-500/10",
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <h4 className="text-sm font-semibold capitalize">
            {category.replace(/-/g, " ")}
          </h4>
          <div className="space-y-2">
            {items.map((kw, idx) => {
              if (!kw?.keyword || !kw?.importance) return null;
              const importanceKey =
                kw.importance as keyof typeof importanceColors;
              const importanceClass =
                importanceColors[importanceKey] ?? "border-muted bg-muted/20";
              return (
                <div
                  key={idx}
                  className={`p-3 border rounded-lg ${importanceClass}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{kw.keyword}</span>
                        <Badge variant="outline" className="text-xs">
                          {kw.importance}
                        </Badge>
                      </div>
                      {kw.whereToAdd && (
                        <p className="text-xs text-muted-foreground">
                          {kw.whereToAdd}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function CoverLetterSection({
  points,
  isLoading,
}: {
  points?: PartialCoverLetterPoint[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  if (!points || points.length === 0) {
    return <p className="text-sm text-muted-foreground">No points yet...</p>;
  }

  return (
    <div className="space-y-3">
      {points.map((point, idx) => {
        if (!point?.point || !point?.focus) return null;
        return (
          <div key={idx} className="p-3 bg-muted rounded-lg space-y-1">
            <p className="text-sm font-medium">{point.point}</p>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Focus:</span> {point.focus}
            </p>
          </div>
        );
      })}
    </div>
  );
}
