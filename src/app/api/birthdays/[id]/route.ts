import { BirthdayDB, UpdateBirthday } from "@/app/schemas/birthday.schema";
import { updateBirthday, deleteBirthday } from "@/app/lib/db";
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

    const updated: BirthdayDB | null = await updateBirthday(id, update);
    if (!updated)
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
      });

    // Serialize for JSON transport
    const out = {
      ...updated,
      _id: String(updated._id),
      date: updated.date,
    };
    return new Response(JSON.stringify(out), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    // Log full error server-side for easier debugging
    console.error("PATCH /api/birthdays/[id] error:", e);
    if (e instanceof Error) {
      return new Response(JSON.stringify(e.message), { status: 500 });
    }
    return new Response(JSON.stringify({ error: "Unknown error" }), {
      status: 500,
    });
  }
}

export async function DELETE(
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

    // Use DB helper to delete
    const deleted: BirthdayDB | null = await deleteBirthday(id);
    if (!deleted) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
      });
    }

    const out = {
      ...deleted,
      _id: String(deleted._id),
      date:
        deleted.date instanceof Date
          ? deleted.date.toISOString()
          : deleted.date,
    };

    return new Response(JSON.stringify(out), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("DELETE /api/birthdays/[id] error:", e);
    if (e instanceof Error) {
      return new Response(JSON.stringify(e.message), { status: 500 });
    }
    return new Response(JSON.stringify({ error: "Unknown error" }), {
      status: 500,
    });
  }
}
