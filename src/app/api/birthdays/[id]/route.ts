import { BirthdayDB, UpdateBirthday } from "@/app/schemas/birthday.schema";
import { parseBirthdayParts, toBirthdayDate } from "@/app/lib/date.utils";
import { updateBirthday, deleteBirthday } from "@/app/lib/db";
import { ObjectId } from "mongodb";
import * as z from "zod";
import { NextRequest, NextResponse } from "next/server";

const PatchBody = z.object({
  name: z.string().min(1).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  day: z.coerce.number().int().min(1).max(31).optional(),
  year: z
    .union([z.coerce.number().int().min(1).max(9999), z.null()])
    .optional(),
  // Backward-compat: Accept legacy date payloads
  date: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const parsed = PatchBody.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const { name, date, month, day, year } = parsed.data;

    const update: UpdateBirthday = {};
    const unsetFields: Array<"date" | "year"> = [];
    if (typeof name === "string") update.name = name;

    if (typeof date === "string") {
      const dt = new Date(date);
      if (Number.isNaN(dt.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }

      const parsedDate = parseBirthdayParts({
        month: dt.getUTCMonth() + 1,
        day: dt.getUTCDate(),
        year: dt.getUTCFullYear(),
      });

      update.month = parsedDate.month;
      update.day = parsedDate.day;
      update.year = parsedDate.year;
      update.date = toBirthdayDate(
        parsedDate.month,
        parsedDate.day,
        parsedDate.year,
      );
    } else if (month !== undefined || day !== undefined || year !== undefined) {
      if (month === undefined || day === undefined) {
        return NextResponse.json(
          {
            error: "Both month and day are required when updating date fields",
          },
          { status: 400 },
        );
      }

      let parsedBirthday: { month: number; day: number; year?: number };
      try {
        parsedBirthday = parseBirthdayParts({
          month,
          day,
          year: year === null ? undefined : year,
        });
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error ? error.message : "Invalid birthday date",
          },
          { status: 400 },
        );
      }

      update.month = parsedBirthday.month;
      update.day = parsedBirthday.day;

      if (year === null) {
        unsetFields.push("year", "date");
      } else if (parsedBirthday.year !== undefined) {
        update.year = parsedBirthday.year;
        update.date = toBirthdayDate(
          parsedBirthday.month,
          parsedBirthday.day,
          parsedBirthday.year,
        );
      }
    }

    if (Object.keys(update).length === 0 && unsetFields.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated: BirthdayDB | null = await updateBirthday(
      id,
      update,
      unsetFields,
    );
    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Serialize for JSON transport
    const out = {
      ...updated,
      _id: String(updated._id),
      date:
        updated.date instanceof Date
          ? updated.date.toISOString()
          : updated.date,
    };
    return NextResponse.json(out, { status: 200 });
  } catch (e) {
    // Log full error server-side for easier debugging
    console.error("PATCH /api/birthdays/[id] error:", e);
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Use DB helper to delete
    const deleted: BirthdayDB | null = await deleteBirthday(id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const out = {
      ...deleted,
      _id: String(deleted._id),
      date:
        deleted.date instanceof Date
          ? deleted.date.toISOString()
          : deleted.date,
    };

    return NextResponse.json(out, { status: 200 });
  } catch (e) {
    console.error("DELETE /api/birthdays/[id] error:", e);
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
