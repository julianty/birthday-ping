import { BirthdayDB, UpdateBirthday } from "@/app/schemas/birthday.schema";
import { clientPromise } from "../../../lib/db";
import { ObjectId } from "mongodb";
import * as z from "zod";

const PatchBody = z.object({
  name: z.string().min(1).optional(),
  // Accept either an ISO string or a bare YYYY-MM-DD date
  date: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id?: string } },
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    if (!id)
      return new Response(JSON.stringify({ error: "Missing id" }), {
        status: 400,
      });
    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Invalid id" }), {
        status: 400,
      });
    }

    const parsed = PatchBody.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.message }), {
        status: 400,
      });
    }

    const { name, date } = parsed.data;

    const update: UpdateBirthday = {};
    if (typeof name === "string") update.name = name;

    if (typeof date === "string") {
      const dt = new Date(date);
      update.date = dt;
      update.month = Number(date.split("-")[1]);
      update.day = Number(date.split("-")[2]);
    } else {
      return new Response(JSON.stringify({ error: "Invalid date" }), {
        status: 400,
      });
    }

    if (Object.keys(update).length === 0) {
      return new Response(JSON.stringify({ error: "Nothing to update" }), {
        status: 400,
      });
    }

    const client = await clientPromise;
    const db = client.db("test");
    const birthdays = db.collection<BirthdayDB>("birthdays");

    const result = await birthdays.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" },
    );

    if (!result)
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
      });
    const updated = result;

    // Serialize for JSON transport
    const out = {
      ...updated,
      _id: String(updated._id),
      date:
        updated.date instanceof Date
          ? updated.date.toISOString()
          : updated.date,
    };
    return new Response(JSON.stringify(out), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    // Log full error server-side for easier debugging
    console.error("PATCH /api/birthdays/[id] error:", e);
    if (e instanceof Error) {
      const payload: any = { error: e.message };
      if (process.env.NODE_ENV !== "production") payload.stack = e.stack;
      return new Response(JSON.stringify(payload), { status: 500 });
    }
    return new Response(JSON.stringify({ error: "Unknown error" }), {
      status: 500,
    });
  }
}
