import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { config } from "@/app/auth";
import { getReminders, deleteBirthday } from "@/app/lib/db";

const DeleteBodySchema = z.object({
  birthdayIds: z.array(z.string().min(1)).min(1),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(config);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = DeleteBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    // Get user's birthdays to verify ownership
    const reminders = await getReminders(session.user.email);
    if (!reminders) {
      return NextResponse.json(
        { error: "Failed to load birthdays" },
        { status: 500 },
      );
    }

    const userBirthdayIds = new Set(reminders.map(b => b._id.toString()));
    const requestedIds = parsed.data.birthdayIds;

    // Only delete birthdays that belong to the user
    const validIds = requestedIds.filter(id => userBirthdayIds.has(id));

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No valid birthdays to delete" },
        { status: 400 },
      );
    }

    // Delete each birthday
    let deletedCount = 0;
    for (const id of validIds) {
      const result = await deleteBirthday(id);
      if (result) {
        deletedCount++;
      }
    }

    return NextResponse.json({
      deletedCount,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete birthdays" },
      { status: 500 }
    );
  }
}
