import { getServerSession } from "next-auth";
import { config } from "@/app/auth";
import { getUserIdFromEmail, updateSubscriptionGroup } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ birthdayId: string }> },
) {
  const session = await getServerSession(config);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { birthdayId } = await params;
    const userId = await getUserIdFromEmail(session.user.email);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    // groupId can be a string or null (to unset)
    const groupId: string | null =
      body.groupId === null || body.groupId === "" ? null : body.groupId;

    const updated = await updateSubscriptionGroup(birthdayId, userId, groupId);
    if (!updated) {
      return NextResponse.json(
        { error: "Subscription not found or unchanged" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, groupId }, { status: 200 });
  } catch (e) {
    console.error("PATCH /api/subscriptions/[birthdayId] error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
