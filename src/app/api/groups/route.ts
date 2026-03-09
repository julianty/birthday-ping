import { getServerSession } from "next-auth";
import { config } from "@/app/auth";
import { createGroup, getUserGroups, getUserIdFromEmail } from "@/app/lib/db";
import { CreateGroupSchema } from "@/app/schemas/group.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(config);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = await getUserIdFromEmail(session.user.email);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const groups = await getUserGroups(userId);
    // Serialize ObjectIds to strings for JSON response
    const plain = groups.map((g) => ({
      ...g,
      _id: g._id.toString(),
      ownerId: g.ownerId.toString(),
      memberIds: g.memberIds.map((m) => m.toString()),
    }));
    return NextResponse.json(plain, { status: 200 });
  } catch (e) {
    console.error("GET /api/groups error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(config);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = await getUserIdFromEmail(session.user.email);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = CreateGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const group = await createGroup(userId, parsed.data);
    // Serialize ObjectIds for JSON response
    const plain = {
      ...group,
      _id: group._id.toString(),
      ownerId: group.ownerId.toString(),
      memberIds: group.memberIds.map((m) => m.toString()),
    };
    return NextResponse.json(plain, { status: 201 });
  } catch (e) {
    console.error("POST /api/groups error:", e);
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
