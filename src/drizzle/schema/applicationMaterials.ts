import {
  pgTable,
  text,
  varchar,
  pgEnum,
  json,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { JobInfoTable } from "./jobInfo";
import { UserTable } from "./user";

export const ApplicationMaterialsTable = pgTable("application_materials", {
  id,
  jobInfoId: uuid()
    .references(() => JobInfoTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: varchar()
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  suggestions: json().notNull(), // Full analysis JSON
  createdAt,
  updatedAt,
});

export const applicationMaterialsRelations = relations(
  ApplicationMaterialsTable,
  ({ one }) => ({
    jobInfo: one(JobInfoTable, {
      fields: [ApplicationMaterialsTable.jobInfoId],
      references: [JobInfoTable.id],
    }),
    user: one(UserTable, {
      fields: [ApplicationMaterialsTable.userId],
      references: [UserTable.id],
    }),
  })
);
