CREATE TABLE "application_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jobInfoId" uuid NOT NULL,
	"userId" varchar NOT NULL,
	"suggestions" json NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_info" ADD COLUMN "aiJobDescription" text;--> statement-breakpoint
ALTER TABLE "job_info" ADD COLUMN "aiRequirements" text;--> statement-breakpoint
ALTER TABLE "application_materials" ADD CONSTRAINT "application_materials_jobInfoId_job_info_id_fk" FOREIGN KEY ("jobInfoId") REFERENCES "public"."job_info"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_materials" ADD CONSTRAINT "application_materials_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;