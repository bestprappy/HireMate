import {
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { UserTable } from "./user";
import { JobInfoTable } from "./jobInfo";
import { relations } from "drizzle-orm";

export const ResumeVersionTable = pgTable("resume_versions", {
  id,
  userId: varchar()
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  jobInfoId: uuid()
    .references(() => JobInfoTable.id, { onDelete: "cascade" })
    .notNull(),
  fileName: varchar(),
  fileType: varchar(),
  fileSize: integer(),
  resumeFileBase64: text().notNull(),
  resumePlainText: text(),
  analysis: jsonb().notNull(),
  overallScore: doublePrecision(),
  atsScore: doublePrecision(),
  jobMatchScore: doublePrecision(),
  writingAndFormattingScore: doublePrecision(),
  keywordCoverageScore: doublePrecision(),
  otherScore: doublePrecision(),
  createdAt,
  updatedAt,
});

export const resumeVersionRelations = relations(
  ResumeVersionTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [ResumeVersionTable.userId],
      references: [UserTable.id],
    }),
    jobInfo: one(JobInfoTable, {
      fields: [ResumeVersionTable.jobInfoId],
      references: [JobInfoTable.id],
    }),
  })
);

