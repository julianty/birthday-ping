import { getServerSession } from "next-auth";
import { config } from "@/app/auth";
import {
  createGroup,
  getUserGroups,
  getGroupById,
  addGroupMember,
  deleteGroup,
} from "@/app/lib/db";
import { CreateGroupSchema } from "@/app/schemas/group.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession(config);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // In a real app, you'd fetch userId from session.user.email
  // For now, we'll return an error asking for userId in query params
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { error: "userId query param required" },
      { status: 400 },
    );
  }

  try {
    const groups = await getUserGroups(userId);
    return NextResponse.json(groups, { status: 200 });
  } catch (e) {
    console.error("GET /api/groups error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(config);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = CreateGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    // In a real app, get userId from session
    const userId = body.userId;
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const group = await createGroup(userId, parsed.data);
    return NextResponse.json(group, { status: 201 });
  } catch (e) {
    console.error("POST /api/groups error:", e);
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
