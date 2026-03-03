import { getServerSession } from "next-auth";
import { config } from "@/app/auth";
import {
  getGroupById,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  getGroupMembers,
} from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(config);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing group id" }, { status: 400 });
    }

    const group = await getGroupById(id);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group, { status: 200 });
  } catch (e) {
    console.error("GET /api/groups/[id] error:", e);
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
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing group id" }, { status: 400 });
    }

    // In a real app, get ownerId from session
    const ownerId = request.headers.get("x-owner-id");
    if (!ownerId) {
      return NextResponse.json({ error: "ownerId required" }, { status: 400 });
    }

    const deleted = await deleteGroup(id, ownerId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Not found or not authorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("DELETE /api/groups/[id] error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
