import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Optional API Key protection
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.IDEAHUB_API_KEY;
  if (!secret) return true;
  return req.headers.get("x-api-key") === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const path = url.pathname;
  const status = url.searchParams.get("status") || "";
  const category = url.searchParams.get("category") || "";
  const search = url.searchParams.get("search") || "";
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);

  if (path.endsWith("/stats")) {
    const total = await db.idea.count();
    const active = await db.idea.count({ where: { isArchived: false } });
    const allActive = await db.idea.findMany({ where: { isArchived: false } });

    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    for (const item of allActive) {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      total_ideas: total,
      active_ideas: active,
      by_status: byStatus,
      by_category: byCategory,
    });
  }

  // List ideas
  const where: any = { isArchived: false };
  if (status) where.status = { equals: status };
  if (category) where.category = { equals: category };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { code: { contains: search } },
    ];
  }

  const ideas = await db.idea.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ success: true, ideas });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const url = new URL(req.url);
  const path = url.pathname;

  // Get idea
  if (path.endsWith("/get")) {
    const ident = body.identifier;
    const idea = await db.idea.findFirst({
      where: {
        OR: [{ id: ident }, { code: ident }],
      },
    });
    if (!idea) {
      return NextResponse.json({ success: false, error: "Idea not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, idea });
  }

  // Create idea
  if (path.endsWith("/create")) {
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ success: false, error: "Title required" }, { status: 400 });
    }
    const code = `AWE-${Math.floor(100 + Math.random() * 900)}`;
    const newIdea = await db.idea.create({
      data: {
        code,
        title,
        subtitle: body.subtitle || "",
        goal: body.goal || "",
        roadmap: body.roadmap || "Design -> Prototyping -> Development",
        team: body.team || "Orange",
        description: body.description || "",
        category: body.category || "Business",
        status: "Proposed",
        creator: body.creator || "Helga Windle",
        collaborators: body.collaborators || "",
        repoUrl: body.repoUrl || "",
        tags: "Increase Innovation",
      },
    });
    return NextResponse.json({ success: true, id: newIdea.id, code: newIdea.code, title: newIdea.title });
  }

  // Move idea
  if (path.endsWith("/move") || path.endsWith("/update")) {
    const ident = body.identifier;
    const idea = await db.idea.findFirst({
      where: { OR: [{ id: ident }, { code: ident }] },
    });
    if (!idea) {
      return NextResponse.json({ success: false, error: "Idea not found" }, { status: 404 });
    }

    const updates = body.updates || {};
    const updated = await db.idea.update({
      where: { id: idea.id },
      data: updates,
    });
    return NextResponse.json({ success: true, idea: updated });
  }

  // Archive idea
  if (path.endsWith("/archive")) {
    const ident = body.identifier;
    const archive = body.archive !== false;
    const idea = await db.idea.findFirst({
      where: { OR: [{ id: ident }, { code: ident }] },
    });
    if (!idea) {
      return NextResponse.json({ success: false, error: "Idea not found" }, { status: 404 });
    }

    await db.idea.update({
      where: { id: idea.id },
      data: {
        isArchived: archive,
        archivedAt: archive ? new Date() : null,
      },
    });
    return NextResponse.json({ success: true, archived: archive });
  }

  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 404 });
}
