import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { config } from "@/app/auth";
import {
  getReminders,
  getUserIdFromEmail,
  updateSubscriptionGroup,
} from "@/app/lib/db";

const AssignGroupBodySchema = z.object({
  birthdayIds: z.array(z.string().min(1)).min(1),
  groupId: z.string().nullable(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(config);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = AssignGroupBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const userId = await getUserIdFromEmail(session.user.email);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership
    const reminders = await getReminders(session.user.email);
    if (!reminders) {
      return NextResponse.json(
        { error: "Failed to load birthdays" },
        { status: 500 },
      );
    }

    const userBirthdayIds = new Set(reminders.map((b) => b._id.toString()));
    const validIds = parsed.data.birthdayIds.filter((id) =>
      userBirthdayIds.has(id),
    );

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No valid birthdays to update" },
        { status: 400 },
      );
    }

    let updatedCount = 0;
    for (const birthdayId of validIds) {
      const result = await updateSubscriptionGroup(
        birthdayId,
        userId,
        parsed.data.groupId,
      );
      if (result) updatedCount++;
    }

    return NextResponse.json({ updatedCount });
  } catch (error) {
    console.error("Bulk assign group error:", error);
    return NextResponse.json(
      { error: "Failed to assign group" },
      { status: 500 },
    );
  }
}
