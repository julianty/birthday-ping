import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { config } from "@/app/auth";
import { parseBirthdayIcsImport } from "@/app/lib/ics-import";
import {
  ImportPreviewBodySchema,
  ImportPreviewResponseSchema,
} from "@/app/schemas/import.schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getServerSession(config);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = ImportPreviewBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const preview = parseBirthdayIcsImport(parsed.data.icsContent);
    const response = ImportPreviewResponseSchema.parse(preview);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("POST /api/birthdays/import/preview error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
