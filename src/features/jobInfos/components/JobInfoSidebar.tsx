"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileTextIcon,
  CodeIcon,
  MicIcon,
  BriefcaseIcon,
  PencilIcon,
  Handshake,
  SparklesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  {
    label: "Technical Questions",
    href: "questions",
    icon: FileTextIcon,
    section: "practice",
  },
  {
    label: "Coding Practice",
    href: "coding-practice",
    icon: CodeIcon,
    section: "practice",
  },
  {
    label: "Mock Interviews",
    href: "interviews",
    icon: MicIcon,
    section: "practice",
  },
  {
    label: "Resume Analysis",
    href: "resume",
    icon: BriefcaseIcon,
    section: "tools",
  },
  {
    label: "Application Customizer",
    href: "application-materials",
    icon: SparklesIcon,
    section: "tools",
  },
  {
    label: "Update Job",
    href: "edit",
    icon: PencilIcon,
    section: "tools",
  },
];

export function JobInfoSidebar({ jobInfoId }: { jobInfoId: string }) {
  const pathname = usePathname();
  const { user } = useUser();

  const practiceItems = navItems.filter((item) => item.section === "practice");
  const toolItems = navItems.filter((item) => item.section === "tools");

  const buildHref = (href: string) => `/app/job-infos/${jobInfoId}/${href}`;

  const isActive = (href: string) => {
    return pathname.includes(`/job-infos/${jobInfoId}/${href}`);
  };

  return (
    <aside className="flex min-h-screen w-80 flex-col border-r bg-background text-sm">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between ">
        <Link
          href="/app"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Handshake className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold">HireMate</span>
            <span className="text-sm text-muted-foreground">Get hired now</span>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Nav sections */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pt-6">
        {/* Practice */}
        <div className="space-y-1">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Practice
          </p>
          {practiceItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={buildHref(item.href)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/40 text-accent-foreground"
                    : "text-foreground hover:bg-accent"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg border",
                    active
                      ? "border-primary/80 bg-primary text-primary-foreground"
                      : "border-border bg-muted/50 group-hover:border-muted-foreground/30"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Tools */}
        <div className="space-y-1">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Tools
          </p>
          {toolItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={buildHref(item.href)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/40 text-accent-foreground"
                    : "text-foreground hover:bg-accent"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg border",
                    active
                      ? "border-primary/80 bg-primary text-primary-foreground"
                      : "border-border bg-muted/50 group-hover:border-muted-foreground/30"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom user card */}
      <div className="border-t bg-muted/30 px-4 py-8">
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              },
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">
              {user?.fullName ?? "Your account"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
