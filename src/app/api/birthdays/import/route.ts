import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { config } from "@/app/auth";
import { addSubscriptionsBulk } from "@/app/lib/db/subscriptions";
import { toBirthdayDate } from "@/app/lib/date.utils";
import { ImportBirthdaysBodySchema } from "@/app/schemas/import.schema";

export async function POST(request: NextRequest) {
  const session = await getServerSession(config);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = ImportBirthdaysBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const insertedCount = await addSubscriptionsBulk(
      session.user.email,
      parsed.data.selections.map((selection) => ({
        groupId: selection.groupId,
        birthdayData: {
          name: selection.normalizedName.trim(),
          month: selection.month,
          day: selection.day,
          ...(typeof selection.year === "number"
            ? {
                year: selection.year,
                date: toBirthdayDate(
                  selection.month,
                  selection.day,
                  selection.year,
                ),
              }
            : {}),
        },
      })),
    );

    return NextResponse.json({ insertedCount }, { status: 201 });
  } catch (error) {
    console.error("POST /api/birthdays/import error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
