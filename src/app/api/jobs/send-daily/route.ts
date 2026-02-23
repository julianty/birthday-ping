import { NextRequest, NextResponse } from "next/server";
import { sendDailyEmail } from "@/app/lib/email";

export async function POST(req: NextRequest) {
  const jobSecret = process.env.GITHUB_JOB_SECRET;
  if (!jobSecret) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    );
  }

  const { secret, userEmail } = await req.json();

  if (secret !== jobSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userEmail || typeof userEmail !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid userEmail" },
      { status: 400 },
    );
  }

  try {
    await sendDailyEmail(userEmail);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
