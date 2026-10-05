import crypto from "crypto";
import { db } from "@/lib/db";

function validSignature(body: string, header: string | null) {
  if (!header) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET!).update(body).digest("hex");
  const a = Buffer.from(header), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const body = await req.text();
  if (!validSignature(body, req.headers.get("x-hub-signature-256"))) return new Response("bad signature", { status: 401 });

  const event = req.headers.get("x-github-event");
  const deliveryId = req.headers.get("x-github-delivery")!;
  const p = JSON.parse(body);
  const repo = p.repository?.full_name as string | undefined;
  if (!repo) return new Response("ok");

  const idea = await db.idea.findUnique({ where: { repoFullName: repo } });
  if (!idea) return new Response("repo not linked"); // ignore repos we don't track

  let e: { type: string; actor: string; title: string; url: string } | null = null;
  if (event === "push" && p.commits?.length) {
    e = { type: "push", actor: p.pusher?.name ?? p.sender.login, url: p.compare,
          title: `${p.commits.length} commit(s): ${p.head_commit?.message?.split("\n")[0] ?? ""}` };
  } else if (event === "pull_request") {
    const pr = p.pull_request;
    const type = p.action === "opened" ? "pr_opened" : p.action === "closed" ? (pr.merged ? "pr_merged" : "pr_closed") : null;
    if (type) e = { type, actor: p.sender.login, title: `#${pr.number} ${pr.title}`, url: pr.html_url };
  } else if (event === "issues" && (p.action === "opened" || p.action === "closed")) {
    e = { type: `issue_${p.action}`, actor: p.sender.login, title: `#${p.issue.number} ${p.issue.title}`, url: p.issue.html_url };
  } else if (event === "release" && p.action === "published") {
    e = { type: "release", actor: p.sender.login, title: p.release.name || p.release.tag_name, url: p.release.html_url };
  }
  if (!e) return new Response("ignored");

  await db.activityEvent.upsert({ where: { deliveryId }, update: {}, create: { deliveryId, ideaId: idea.id, ...e } });
  return new Response("ok");
}
