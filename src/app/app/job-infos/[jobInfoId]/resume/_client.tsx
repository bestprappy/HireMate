"use client";

import { useObject } from "@ai-sdk/react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { aiAnalyzeSchema } from "@/services/ai/resumes/schemas";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AnalysisResults } from "./_components/AnalysisResults";

export function ResumePageClient({
  jobInfoId,
  interviewId,
}: {
  jobInfoId: string;
  interviewId?: string;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [useInterviewFeedback, setUseInterviewFeedback] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  const {
    object: aiAnalysis,
    isLoading,
    submit: generateAnalysis,
  } = useObject({
    api:
      useInterviewFeedback && interviewId
        ? "/api/ai/resumes/analyze-with-interview"
        : "/api/ai/resumes/analyze",
    schema: aiAnalyzeSchema,
    fetch: (url, options) => {
      const headers = new Headers(options?.headers);
      headers.delete("Content-Type");

      const formData = new FormData();
      if (fileRef.current) {
        formData.append("resumeFile", fileRef.current);
      }
      formData.append("jobInfoId", jobInfoId);

      if (useInterviewFeedback && interviewId) {
        formData.append("interviewId", interviewId);
      }

      return fetch(url, { ...options, headers, body: formData });
    },
  });

  function handleFileUpload(file: File | null) {
    fileRef.current = file;
    if (file == null) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, Word document, or text file");
      return;
    }

    setUploadedFileName(file.name);
    generateAnalysis(null);
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-8 w-full">
      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading ? "Analyzing your resume" : "Upload your resume"}
          </CardTitle>
          <CardDescription>
            {isLoading
              ? "This may take a couple minutes"
              : "Get personalized feedback on your resume based on the job"}
          </CardDescription>

          {interviewId && (
            <div className="mt-4 flex items-center gap-2">
              <Checkbox
                id="use-interview"
                checked={useInterviewFeedback}
                onCheckedChange={(checked) =>
                  setUseInterviewFeedback(checked as boolean)
                }
              />
              <label htmlFor="use-interview" className="text-sm cursor-pointer">
                Use interview feedback to improve recommendations
              </label>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            {uploadedFileName && !isLoading ? (
              <div>
                <p className="text-sm font-medium text-green-600 mb-2">
                  ✓ File uploaded: {uploadedFileName}
                </p>
                <Button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleFileUpload(file);
                    };
                    input.click();
                  }}
                  variant="outline"
                >
                  Choose Different File
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 font-medium mb-2">
                  Drag and drop your resume here
                </p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                  id="resume-upload"
                />
                <Button
                  onClick={() =>
                    document.getElementById("resume-upload")?.click()
                  }
                  disabled={isLoading}
                >
                  Browse Files
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AnalysisResults aiAnalysis={aiAnalysis} isLoading={isLoading} />
    </div>
  );
}
