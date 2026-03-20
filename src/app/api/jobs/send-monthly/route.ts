import { sendMonthlyEmail } from "@/app/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const jobSecret = process.env.GITHUB_MONTHLY_JOB_SECRET;
  if (!jobSecret) {
    return NextResponse.json(
      {
        error: "Server misconfiguration",
      },
      { status: 500 },
    );
  }
  const secret = req.headers.get("x-job-secret");
  //   const { secret } = await req.json();
  if (jobSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await sendMonthlyEmail();
    return NextResponse.json(
      { message: "Successfully sent monthly emails" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
