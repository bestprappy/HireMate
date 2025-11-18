import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { redirect } from "next/navigation"
import { OnboardingClient } from "./_client"
import { upsertUser } from "@/features/users/db"
import { clerkClient } from "@clerk/nextjs/server"

export default async function OnboardingPage() {
  const { userId, user } = await getCurrentUser({ allData: true })

  if (userId == null) return redirect("/")
  if (user != null) return redirect("/app")

  // If the local user row doesn't exist yet, attempt to create it
  // using Clerk server SDK to fetch profile details. This prevents
  // the onboarding client from polling indefinitely when webhooks
  // are not configured or delayed in development.
  try {
    const clerkUser = await clerkClient.users.getUser(userId)

    const email = clerkUser.emailAddresses?.find(
      (e: any) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress

    await upsertUser({
      id: clerkUser.id,
      email: email ?? "",
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`,
      imageUrl: clerkUser.profileImageUrl ?? "",
      createdAt: new Date(clerkUser.createdAt ?? Date.now()),
      updatedAt: new Date(clerkUser.updatedAt ?? Date.now()),
    })

    return redirect("/app")
  } catch (err) {
    // If we can't fetch/create user for any reason, fall back to the
    // existing client polling UI so the webhook (if configured) can
    // still complete the creation.
    // eslint-disable-next-line no-console
    console.warn("Onboarding server-side creation failed:", err)
  }

  return (
    <div className="container flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl">Creating your account...</h1>
      <OnboardingClient userId={userId} />
    </div>
  )
}
