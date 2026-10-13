"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

async function getEffectiveUserId() {
  try {
    const s = await auth();
    const id = (s?.user as any)?.id as string | undefined;
    if (id) return id;
  } catch (e) {
    // Auth not configured or no session
  }
  return "user-helga";
}

function getCategoryIcon(category: string): string {
  switch (category?.toLowerCase()) {
    case "business":
      return "💼";
    case "health":
      return "🌿";
    case "technology":
      return "💻";
    case "education":
      return "📚";
    case "lifestyle":
      return "🎯";
    default:
      return "💡";
  }
}

export async function getIdeas() {
  const ideas = await db.idea.findMany({
    where: { isArchived: false },
    orderBy: { createdAt: "desc" },
  });

  return ideas.map((idea) => ({
    id: idea.id,
    code: idea.code || `AWE-${idea.id.slice(0, 4)}`,
    title: idea.title,
    subtitle: idea.subtitle || "",
    goal: idea.goal || "",
    roadmap: idea.roadmap || "",
    team: idea.team || "",
    description: idea.description || "",
    author: idea.creator,
    created: formatTimeAgo(idea.createdAt),
    createdAt: idea.createdAt.toISOString(),
    statusText: idea.status,
    statusIcon: getStatusIcon(idea.status),
    category: idea.category,
    icon: idea.icon || getCategoryIcon(idea.category),
    votes: idea.votes,
    tags: idea.tags ? idea.tags.split(",").map((t) => t.trim()) : ["Increase Innovation"],
    collaborators: idea.collaborators || "",
    repoUrl: idea.repoUrl || "",
    inProgressUrl: idea.inProgressUrl || "",
  }));
}

export async function getArchivedIdeas() {
  const ideas = await db.idea.findMany({
    where: { isArchived: true },
    orderBy: { archivedAt: "desc" },
  });

  return ideas.map((idea) => ({
    id: idea.id,
    code: idea.code || `AWE-${idea.id.slice(0, 4)}`,
    title: idea.title,
    author: idea.creator,
    date: idea.archivedAt ? idea.archivedAt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Recently",
    category: idea.category,
    status: idea.status,
  }));
}

export async function getIdeaById(id: string) {
  const idea = await db.idea.findFirst({
    where: {
      OR: [{ id: id }, { code: id }],
    },
    include: {
      createdBy: true,
    },
  });

  if (!idea) return null;

  return {
    id: idea.id,
    code: idea.code || `AWE-${idea.id.slice(0, 4)}`,
    title: idea.title,
    subtitle: idea.subtitle || "",
    goal: idea.goal || "",
    roadmap: idea.roadmap || "",
    team: idea.team || "",
    description: idea.description || "",
    author: idea.creator,
    created: formatTimeAgo(idea.createdAt),
    updatedAt: idea.updatedAt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    statusText: idea.status,
    statusIcon: getStatusIcon(idea.status),
    category: idea.category,
    icon: idea.icon || getCategoryIcon(idea.category),
    votes: idea.votes,
    tags: idea.tags ? idea.tags.split(",").map((t) => t.trim()) : ["Increase Innovation"],
    collaborators: idea.collaborators || "",
    repoUrl: idea.repoUrl || "",
    inProgressUrl: idea.inProgressUrl || "",
    isArchived: idea.isArchived,
    attachments: idea.attachments ? (JSON.parse(idea.attachments) as { name: string; url: string; size?: string; date?: string }[]) : [],
    linkedIssues: idea.linkedIssues ? (JSON.parse(idea.linkedIssues) as { id: string; title: string; url?: string }[]) : [],
  };
}

export async function createIdea(formData: FormData) {
  const uid = await getEffectiveUserId();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const goal = String(formData.get("goal") ?? "").trim();
  const roadmap = String(formData.get("roadmap") ?? "").trim();
  const team = String(formData.get("team") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const creator = String(formData.get("creator") ?? "").trim() || "Helga Windle";
  const collaborators = String(formData.get("collaborators") ?? "").trim();
  const repoUrl = String(formData.get("repoUrl") ?? "").trim();
  const inProgressUrl = String(formData.get("inProgressUrl") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || "Business";
  const status = "Proposed";

  // Generate code e.g. AWE-345
  const randomNum = Math.floor(100 + Math.random() * 900);
  const code = `AWE-${randomNum}`;
  const icon = getCategoryIcon(category);

  const newIdea = await db.idea.create({
    data: {
      code,
      title,
      subtitle,
      goal,
      roadmap: roadmap || "Design -> Prototyping -> Development",
      team: team || "Orange",
      description,
      creator,
      collaborators,
      repoUrl,
      inProgressUrl,
      category,
      status,
      icon,
      tags: "Increase Innovation",
      createdById: uid,
    },
  });

  revalidatePath("/");
  revalidatePath("/archive");
  redirect(`/ideas/${newIdea.id}`);
}

export async function archiveIdea(id: string) {
  await db.idea.update({
    where: { id },
    data: {
      isArchived: true,
      archivedAt: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath(`/ideas/${id}`);
  return { success: true };
}

export async function unarchiveIdea(id: string) {
  await db.idea.update({
    where: { id },
    data: {
      isArchived: false,
      archivedAt: null,
    },
  });

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath(`/ideas/${id}`);
  return { success: true };
}

export async function updateIdea(
  id: string,
  updates: {
    title?: string;
    subtitle?: string;
    goal?: string;
    roadmap?: string;
    description?: string;
    collaborators?: string;
    repoUrl?: string;
    inProgressUrl?: string;
    category?: string;
    status?: string;
  }
) {
  const data: Record<string, any> = { ...updates };
  if (updates.category) {
    data.icon = getCategoryIcon(updates.category);
  }

  await db.idea.update({
    where: { id },
    data,
  });

  revalidatePath("/");
  revalidatePath(`/ideas/${id}`);
  return { success: true };
}

export async function addAttachment(
  id: string,
  attachment: { name: string; url: string; size?: string; date?: string }
) {
  const idea = await db.idea.findUnique({ where: { id } });
  if (!idea) return { success: false, message: "Idea not found" };

  const current: any[] = idea.attachments ? JSON.parse(idea.attachments) : [];
  current.push({
    name: attachment.name,
    url: attachment.url,
    size: attachment.size || "Unknown",
    date: attachment.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  });

  await db.idea.update({
    where: { id },
    data: { attachments: JSON.stringify(current) },
  });

  revalidatePath(`/ideas/${id}`);
  return { success: true, attachments: current };
}

export async function deleteAttachment(id: string, index: number) {
  const idea = await db.idea.findUnique({ where: { id } });
  if (!idea) return { success: false };

  const current: any[] = idea.attachments ? JSON.parse(idea.attachments) : [];
  current.splice(index, 1);

  await db.idea.update({
    where: { id },
    data: { attachments: JSON.stringify(current) },
  });

  revalidatePath(`/ideas/${id}`);
  return { success: true, attachments: current };
}

export async function addLinkedIssue(
  id: string,
  issue: { id: string; title: string; url?: string }
) {
  const idea = await db.idea.findUnique({ where: { id } });
  if (!idea) return { success: false, message: "Idea not found" };

  const current: any[] = idea.linkedIssues ? JSON.parse(idea.linkedIssues) : [];
  current.push({
    id: issue.id,
    title: issue.title || issue.id,
    url: issue.url || (issue.id.startsWith("http") ? issue.id : `https://github.com/issues/${issue.id.replace("#", "")}`),
  });

  await db.idea.update({
    where: { id },
    data: { linkedIssues: JSON.stringify(current) },
  });

  revalidatePath(`/ideas/${id}`);
  return { success: true, linkedIssues: current };
}

export async function deleteLinkedIssue(id: string, index: number) {
  const idea = await db.idea.findUnique({ where: { id } });
  if (!idea) return { success: false };

  const current: any[] = idea.linkedIssues ? JSON.parse(idea.linkedIssues) : [];
  current.splice(index, 1);

  await db.idea.update({
    where: { id },
    data: { linkedIssues: JSON.stringify(current) },
  });

  revalidatePath(`/ideas/${id}`);
  return { success: true, linkedIssues: current };
}

export async function moveIdea(id: string, updates: { status?: string; category?: string }) {
  const data: Record<string, string> = {};
  if (updates.status) data.status = updates.status;
  if (updates.category) {
    data.category = updates.category;
    data.icon = getCategoryIcon(updates.category);
  }

  await db.idea.update({
    where: { id },
    data,
  });

  revalidatePath("/");
  revalidatePath(`/ideas/${id}`);
  return { success: true };
}

export async function mergeIdeas(sourceId: string, targetIdentifier: string) {
  const target = await db.idea.findFirst({
    where: {
      OR: [{ id: targetIdentifier }, { code: targetIdentifier }, { title: { contains: targetIdentifier } }],
    },
  });

  if (!target) {
    return { success: false, message: `Could not find an idea matching "${targetIdentifier}".` };
  }

  const source = await db.idea.findUnique({ where: { id: sourceId } });
  if (!source) return { success: false, message: "Source idea not found." };

  // Combine collaborators
  const existingCollabs = target.collaborators ? target.collaborators.split(",").map((s) => s.trim()) : [];
  if (source.creator && !existingCollabs.includes(source.creator)) {
    existingCollabs.push(source.creator);
  }
  if (source.collaborators) {
    source.collaborators.split(",").forEach((c) => {
      const trimmed = c.trim();
      if (trimmed && !existingCollabs.includes(trimmed)) existingCollabs.push(trimmed);
    });
  }

  // Update target idea
  await db.idea.update({
    where: { id: target.id },
    data: {
      collaborators: existingCollabs.join(", "),
      votes: { increment: source.votes || 1 },
    },
  });

  // Archive source idea with note
  await db.idea.update({
    where: { id: sourceId },
    data: {
      isArchived: true,
      archivedAt: new Date(),
      status: `Merged into ${target.code || target.title}`,
    },
  });

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath(`/ideas/${sourceId}`);
  revalidatePath(`/ideas/${target.id}`);

  return { success: true, targetId: target.id, targetTitle: target.title };
}

function getStatusIcon(status: string): string {
  switch (status?.toLowerCase()) {
    case "proposed":
      return "🚀";
    case "in review":
      return "ℹ️";
    case "approved":
      return "✅";
    case "in progress":
      return "⚡";
    case "done":
      return "🎉";
    case "archived":
    case "shelved":
      return "🗄️";
    default:
      return "💡";
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffInDays <= 0) return "today";
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y ago`;
}
