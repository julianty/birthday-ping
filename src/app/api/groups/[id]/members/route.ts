import { getServerSession } from "next-auth";
import { config } from "@/app/auth";
import { addGroupMember, removeGroupMember } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(config);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: groupId } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!groupId || !userId) {
      return NextResponse.json(
        { error: "groupId and userId required" },
        { status: 400 },
      );
    }

    const added = await addGroupMember(groupId, userId);
    if (!added) {
      return NextResponse.json(
        { error: "Failed to add member" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("POST /api/groups/[id]/members error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(config);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: groupId } = await params;
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");

    if (!groupId || !userId) {
      return NextResponse.json(
        { error: "groupId and userId required" },
        { status: 400 },
      );
    }

    const removed = await removeGroupMember(groupId, userId);
    if (!removed) {
      return NextResponse.json(
        { error: "Failed to remove member" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("DELETE /api/groups/[id]/members error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
