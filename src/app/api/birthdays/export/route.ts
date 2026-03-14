import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { config } from "@/app/auth";
import { getReminders } from "@/app/lib/db";
import { generateBirthdayIcs } from "@/app/lib/ics";

const ExportBodySchema = z.object({
  birthdayIds: z.array(z.string().min(1)).min(1),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(config);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = ExportBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const reminders = await getReminders(session.user.email);
    if (!reminders) {
      return NextResponse.json(
        { error: "Failed to load birthdays for export" },
        { status: 500 },
      );
    }

    const requestedIdSet = new Set(parsed.data.birthdayIds);

    const selectedBirthdays = reminders
      .filter((birthday) => requestedIdSet.has(birthday._id.toString()))
      .map((birthday) => ({
        _id: birthday._id.toString(),
        name: birthday.name,
        month: birthday.month,
        day: birthday.day,
        ...(typeof birthday.year === "number" ? { year: birthday.year } : {}),
        createdBy: birthday.createdBy.toString(),
        ...(birthday.groupId ? { groupId: birthday.groupId.toString() } : {}),
        ...(birthday.groupName ? { groupName: birthday.groupName } : {}),
      }));

    if (selectedBirthdays.length === 0) {
      return NextResponse.json(
        { error: "No valid birthdays selected for export" },
        { status: 400 },
      );
    }

    const icsContent = generateBirthdayIcs(selectedBirthdays);
    const dateLabel = new Date().toISOString().slice(0, 10);
    const filename = `birthdays-${dateLabel}.ics`;

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"${filename}\"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("POST /api/birthdays/export error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
