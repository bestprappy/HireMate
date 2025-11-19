"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Navbar } from "./_Navbar";

export function AppLayoutClient({
  children,
  user,
}: {
  children: ReactNode;
  user: { imageUrl: string; name: string };
}) {
  const pathname = usePathname();
  const isJobInfoPage =
    pathname.includes("/job-infos/") && pathname !== "/app/job-infos/new";

  return (
    <div className="h-screen flex flex-col">
      {!isJobInfoPage && <Navbar user={user} />}
      <main className="flex-1 flex flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
