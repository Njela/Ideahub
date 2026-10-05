"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

async function requireUserId() {
  const s = await auth();
  const id = (s?.user as any)?.id as string | undefined;
  if (!id) redirect("/api/auth/signin");
  return id;
}

export async function createIdea(fd: FormData) {
  const uid = await requireUserId();
  const title = String(fd.get("title") ?? "").trim();
  if (!title) return;
  const idea = await db.idea.create({
    data: {
      title, createdById: uid,
      description: String(fd.get("description") ?? ""),
      revisions: { create: { authorId: uid, version: 1, changes: { title: { from: null, to: title } }, note: "Created" } },
    },
  });
  redirect(`/ideas/${idea.id}`);
}

const FIELDS = ["title", "description", "status", "repoFullName"] as const;

export async function updateIdea(fd: FormData) {
  const uid = await requireUserId();
  const id = String(fd.get("id"));
  const baseVersion = Number(fd.get("version"));
  const note = String(fd.get("note") ?? "").trim() || null;

  const idea = await db.idea.findUniqueOrThrow({ where: { id } });
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const f of FIELDS) {
    const next = String(fd.get(f) ?? "").trim() || (f === "repoFullName" ? null : "");
    const prev = (idea as any)[f] ?? (f === "repoFullName" ? null : "");
    if (next !== prev) changes[f] = { from: prev, to: next };
  }
  if (!Object.keys(changes).length) return;

  // Optimistic lock: only succeeds if nobody saved since this form was loaded.
  await db.$transaction(async (tx) => {
    const res = await tx.idea.updateMany({
      where: { id, version: baseVersion },
      data: {
        version: { increment: 1 },
        ...Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.to])),
      },
    });
    if (res.count !== 1) throw new Error("This idea changed while you were editing. Reload and try again.");
    await tx.revision.create({
      data: { ideaId: id, authorId: uid, version: baseVersion + 1, changes: changes as any, note },
    });
  });
  revalidatePath(`/ideas/${id}`);
}
