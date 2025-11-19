import { deleteUser, upsertUser } from "@/features/users/db";
import { env } from "@/data/env/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // Get webhook secret
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return new Response("Missing webhook secret", { status: 500 });
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers");
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: any;

  // Verify the payload with the headers
  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Handle the webhook
  try {
    const eventType = event.type;
    console.log(`Webhook received: ${eventType}`);

    switch (eventType) {
      case "user.created":
      case "user.updated":
        const clerkData = event.data;
        const email = clerkData.email_addresses.find(
          (e: any) => e.id === clerkData.primary_email_address_id
        )?.email_address;

        if (email == null) {
          console.error("No primary email found for user:", clerkData.id);
          return new Response("No primary email found", { status: 400 });
        }

        console.log(`Upserting user: ${clerkData.id} - ${email}`);

        await upsertUser({
          id: clerkData.id,
          email,
          name: `${clerkData.first_name || ""} ${
            clerkData.last_name || ""
          }`.trim(),
          imageUrl: clerkData.image_url,
          createdAt: new Date(clerkData.created_at),
          updatedAt: new Date(clerkData.updated_at),
        });

        console.log(`User upserted successfully: ${clerkData.id}`);
        break;

      case "user.deleted":
        if (event.data.id == null) {
          console.error("No user ID found in delete event");
          return new Response("No user ID found", { status: 400 });
        }

        console.log(`Deleting user: ${event.data.id}`);
        await deleteUser(event.data.id);
        console.log(`User deleted successfully: ${event.data.id}`);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      `Webhook processing error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { status: 500 }
    );
  }
}
