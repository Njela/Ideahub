"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getIdeaById,
  archiveIdea,
  moveIdea,
  mergeIdeas,
  updateIdea,
  addAttachment,
  deleteAttachment,
  addLinkedIssue,
  deleteLinkedIssue,
} from "@/app/actions";

type ModalState = {
  isOpen: boolean;
  title: string;
  type: "alert" | "prompt" | "confirm";
  placeholder?: string;
  onConfirm?: (val?: string) => void;
};

type Attachment = {
  name: string;
  url: string;
  size?: string;
  date?: string;
};

type LinkedIssue = {
  id: string;
  title: string;
  url?: string;
};

type IdeaDetail = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  goal: string;
  roadmap: string;
  team: string;
  description: string;
  author: string;
  created: string;
  updatedAt: string;
  statusText: string;
  statusIcon: string;
  category: string;
  icon: string;
  votes: number;
  tags: string[];
  collaborators: string;
  repoUrl: string;
  inProgressUrl: string;
  isArchived: boolean;
  attachments: Attachment[];
  linkedIssues: LinkedIssue[];
};

const TEMPLATES = [
  {
    name: "Product Innovation Pitch",
    description: "Structure a brand new customer-facing feature or product concept.",
    content:
      "### Problem Statement\nWhat pain point are customers experiencing?\n\n### Proposed Solution\nHow does this idea uniquely address the problem?\n\n### Target Audience\nWho will use this product and when?\n\n### Key Success Metrics\nHow will we measure adoption and impact?",
  },
  {
    name: "Engineering & Architecture Proposal",
    description: "Propose a refactor, infrastructure upgrade, or technical optimization.",
    content:
      "### Current Architecture Limitations\nWhat are the scalability or reliability bottlenecks?\n\n### Proposed Technical Design\nOverview of new components, databases, or API integrations.\n\n### Implementation Milestones\n1. Phase 1: PoC\n2. Phase 2: Staging rollout\n3. Phase 3: Production migration\n\n### Security & Performance Impact\nExpected latency reduction and security posture improvements.",
  },
  {
    name: "Growth & Retention Initiative",
    description: "Outline a growth loop, onboarding change, or user retention project.",
    content:
      "### Objective\nIncrease 30-day user retention by 15%.\n\n### Proposed Changes\nSimplified user onboarding with interactive milestone guidance.\n\n### User Journey\n1. Signup -> 2. First action -> 3. Return trigger\n\n### Experiment Setup\nA/B test with 20% of new cohort users.",
  },
];

export default function IdeaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("History");
  const [modal, setModal] = useState<ModalState>({ isOpen: false, title: "", type: "alert" });
  const [modalInput, setModalInput] = useState("");

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    goal: "",
    roadmap: "",
    collaborators: "",
    repoUrl: "",
    inProgressUrl: "",
    category: "Business",
    status: "Proposed",
  });

  // Modal States for interactive buttons
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [attachmentForm, setAttachmentForm] = useState({ name: "", url: "", size: "" });
  const [selectedLocalFile, setSelectedLocalFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [linkIssueModalOpen, setLinkIssueModalOpen] = useState(false);
  const [linkIssueForm, setLinkIssueForm] = useState({ id: "", title: "", url: "" });

  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  useEffect(() => {
    async function loadIdea() {
      try {
        const data = await getIdeaById(params.id);
        if (data) {
          setIdea(data);
          setEditForm({
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            goal: data.goal,
            roadmap: data.roadmap,
            collaborators: data.collaborators,
            repoUrl: data.repoUrl,
            inProgressUrl: data.inProgressUrl,
            category: data.category,
            status: data.statusText,
          });
        }
      } catch (err) {
        console.error("Failed to load idea:", err);
      } finally {
        setLoading(false);
      }
    }
    loadIdea();
  }, [params.id]);

  const refreshIdea = async () => {
    const updated = await getIdeaById(params.id);
    if (updated) {
      setIdea(updated);
      setEditForm({
        title: updated.title,
        subtitle: updated.subtitle,
        description: updated.description,
        goal: updated.goal,
        roadmap: updated.roadmap,
        collaborators: updated.collaborators,
        repoUrl: updated.repoUrl,
        inProgressUrl: updated.inProgressUrl,
        category: updated.category,
        status: updated.statusText,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!idea) return;
    setIsSaving(true);
    try {
      await updateIdea(idea.id, editForm);
      await refreshIdea();
      setIsEditing(false);
      setModal({ isOpen: true, title: "Idea updated successfully! ✨", type: "alert" });
    } catch (err) {
      console.error(err);
      setModal({ isOpen: true, title: "Failed to save idea changes.", type: "alert" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedLocalFile(file);
    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setAttachmentForm((prev) => ({
      ...prev,
      name: prev.name || file.name,
      size: sizeStr,
    }));
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea) return;

    let finalName = attachmentForm.name.trim();
    if (!finalName && selectedLocalFile) {
      finalName = selectedLocalFile.name;
    }
    if (!finalName) {
      setModal({ isOpen: true, title: "Please choose a file or enter an attachment label.", type: "alert" });
      return;
    }

    let fileUrl = attachmentForm.url.trim();

    if (selectedLocalFile && !fileUrl) {
      try {
        fileUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || "#");
          reader.readAsDataURL(selectedLocalFile);
        });
      } catch (err) {
        fileUrl = "#";
      }
    }

    try {
      await addAttachment(idea.id, {
        name: finalName,
        url: fileUrl || "#",
        size: attachmentForm.size || (selectedLocalFile ? `${Math.round(selectedLocalFile.size / 1024)} KB` : "1.2 MB"),
      });
      await refreshIdea();
      setAttachmentModalOpen(false);
      setSelectedLocalFile(null);
      setAttachmentForm({ name: "", url: "", size: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAttachment = async (index: number) => {
    if (!idea) return;
    await deleteAttachment(idea.id, index);
    await refreshIdea();
  };

  const handleAddLinkedIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea || !linkIssueForm.id) return;
    try {
      await addLinkedIssue(idea.id, {
        id: linkIssueForm.id,
        title: linkIssueForm.title || linkIssueForm.id,
        url: linkIssueForm.url,
      });
      await refreshIdea();
      setLinkIssueModalOpen(false);
      setLinkIssueForm({ id: "", title: "", url: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLinkedIssue = async (index: number) => {
    if (!idea) return;
    await deleteLinkedIssue(idea.id, index);
    await refreshIdea();
  };

  const handleApplyTemplate = async (templateContent: string) => {
    if (!idea) return;
    const combined = editForm.description
      ? `${editForm.description}\n\n${templateContent}`
      : templateContent;

    setEditForm((prev) => ({ ...prev, description: combined }));
    if (!isEditing) {
      await updateIdea(idea.id, { description: combined });
      await refreshIdea();
    }
    setTemplateModalOpen(false);
    setModal({
      isOpen: true,
      title: "Template applied to description! You can now edit the sections.",
      type: "alert",
    });
  };

  const handleMove = () => {
    if (!idea) return;
    setModal({
      isOpen: true,
      title: "Move this idea to a different Status or Category? (Type 'status' or 'category')",
      type: "prompt",
      placeholder: "status / category",
      onConfirm: (val) => {
        if (val?.toLowerCase() === "status") {
          setModal({
            isOpen: true,
            title: "Enter new status (Proposed, In Review, Approved, In Progress, Done, Archived):",
            type: "prompt",
            placeholder: "e.g. In Progress",
            onConfirm: async (newStatus) => {
              if (newStatus) {
                if (newStatus.trim().toLowerCase() === "archived") {
                  await archiveIdea(idea.id);
                  setModal({
                    isOpen: true,
                    title: `Idea status set to Archived! Dropped into the Archive box.`,
                    type: "alert",
                    onConfirm: () => {
                      setModal({ isOpen: false, title: "", type: "alert" });
                      router.push("/archive");
                    },
                  });
                } else {
                  await moveIdea(idea.id, { status: newStatus });
                  await refreshIdea();
                  setModal({ isOpen: true, title: `Idea status updated to "${newStatus}"!`, type: "alert" });
                }
              } else {
                setModal({ isOpen: false, title: "", type: "alert" });
              }
            },
          });
        } else if (val?.toLowerCase() === "category") {
          setModal({
            isOpen: true,
            title: "Enter new category (Business, Technology, Education, Health, Lifestyle):",
            type: "prompt",
            placeholder: "e.g. Technology",
            onConfirm: async (newCat) => {
              if (newCat) {
                await moveIdea(idea.id, { category: newCat });
                await refreshIdea();
                setModal({ isOpen: true, title: `Idea category updated to "${newCat}"!`, type: "alert" });
              } else {
                setModal({ isOpen: false, title: "", type: "alert" });
              }
            },
          });
        } else {
          setModal({ isOpen: false, title: "", type: "alert" });
        }
      },
    });
    setModalInput("");
  };

  const handleClone = () => {
    const repoElement = document.getElementById("repo-link-section");
    if (repoElement) {
      repoElement.scrollIntoView({ behavior: "smooth", block: "center" });
      repoElement.style.background = "var(--line)";
      setTimeout(() => (repoElement.style.background = "transparent"), 1500);
    }
  };

  const handleMerge = () => {
    if (!idea) return;
    setModal({
      isOpen: true,
      title: "Enter the ID, Code, or Title of the idea you want to merge with:",
      type: "prompt",
      placeholder: "e.g. AWE-222 or ACME",
      onConfirm: async (targetId) => {
        if (targetId) {
          const res = await mergeIdeas(idea.id, targetId);
          if (res.success) {
            setModal({
              isOpen: true,
              title: `Successfully merged into "${res.targetTitle}"! This idea has been archived.`,
              type: "alert",
              onConfirm: () => {
                setModal({ isOpen: false, title: "", type: "alert" });
                router.push(`/ideas/${res.targetId}`);
              },
            });
          } else {
            setModal({ isOpen: true, title: res.message || "Merge failed.", type: "alert" });
          }
        } else {
          setModal({ isOpen: false, title: "", type: "alert" });
        }
      },
    });
    setModalInput("");
  };

  const handleArchive = () => {
    if (!idea) return;
    setModal({
      isOpen: true,
      title: "Are you sure you want to drop this idea into the Archive box?",
      type: "confirm",
      onConfirm: async () => {
        await archiveIdea(idea.id);
        setModal({
          isOpen: true,
          title: "Idea successfully dropped into the Archive box! 🗄️",
          type: "alert",
          onConfirm: () => {
            setModal({ isOpen: false, title: "", type: "alert" });
            router.push("/archive");
          },
        });
      },
    });
  };

  const getTabStyle = (tabName: string) => {
    return activeTab === tabName
      ? { paddingBottom: "8px", cursor: "pointer", color: "var(--accent)", fontWeight: 500, borderBottom: "2px solid var(--accent)" }
      : { paddingBottom: "8px", cursor: "pointer", color: "var(--muted)", fontWeight: 500 };
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px", textAlign: "center", color: "var(--muted)" }}>
        Loading idea details from database...
      </div>
    );
  }

  if (!idea) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px", textAlign: "center" }}>
        <h2>Idea Not Found</h2>
        <p style={{ color: "var(--muted)", marginBottom: "24px" }}>The requested idea does not exist or has been removed.</p>
        <Link href="/" style={{ color: "var(--accent)", textDecoration: "none" }}>
          &larr; Back to all ideas
        </Link>
      </div>
    );
  }

  const roadmapSteps = (isEditing ? editForm.roadmap : idea.roadmap)
    ? (isEditing ? editForm.roadmap : idea.roadmap).split("->").map((s) => s.trim())
    : ["Design", "Prototyping", "Development"];

  return (
    <div className="ideas-layout" style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ width: "100%" }}>
        {/* Top Header */}
        <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "16px", marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ flex: 1, minWidth: "280px" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "8px" }}>
                <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
                  All ideas
                </Link>{" "}
                / <span style={{ color: "var(--accent)" }}>{idea.icon}</span> {idea.code}
              </div>

              {isEditing ? (
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: "4px" }}>Idea Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    style={{ width: "100%", fontSize: "1.5rem", padding: "8px 12px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)", fontWeight: 500 }}
                  />
                </div>
              ) : (
                <h2 style={{ fontSize: "2rem", margin: 0 }}>{idea.title}</h2>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--line)", borderRadius: "4px", cursor: "pointer", color: "var(--fg)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    style={{ padding: "8px 20px", background: "var(--accent)", color: "var(--bg)", border: "none", borderRadius: "4px", cursor: isSaving ? "not-allowed" : "pointer", fontWeight: 500 }}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="action-link"
                    onClick={() => setIsEditing(true)}
                    style={{ background: "transparent", border: "1px solid var(--line)", padding: "6px 14px", borderRadius: "4px", cursor: "pointer", color: "var(--fg)", fontWeight: 500 }}
                  >
                    ✏️ Edit
                  </button>
                  <button className="action-link" onClick={handleMove}>
                    Move
                  </button>
                  <button className="action-link" onClick={handleClone}>
                    Clone
                  </button>
                  <button className="action-link" onClick={handleMerge}>
                    Merge
                  </button>
                  <button className="action-link" onClick={handleArchive}>
                    Archive
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Main View */}
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
          {/* Left Column */}
          <div style={{ flex: 2, minWidth: "320px" }}>
            {/* Action tools: Add attachment, Link issue */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
              <button
                className="btn-cancel"
                onClick={() => setAttachmentModalOpen(true)}
                style={{ fontSize: "0.85rem", display: "flex", gap: "8px", alignItems: "center", padding: "8px 14px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)", cursor: "pointer" }}
              >
                <span>📎</span> Add attachment {idea.attachments.length > 0 && `(${idea.attachments.length})`}
              </button>
              <button
                className="btn-cancel"
                onClick={() => setLinkIssueModalOpen(true)}
                style={{ fontSize: "0.85rem", display: "flex", gap: "8px", alignItems: "center", padding: "8px 14px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)", cursor: "pointer" }}
              >
                <span>🔗</span> Link issue {idea.linkedIssues.length > 0 && `(${idea.linkedIssues.length})`}
              </button>
            </div>

            {/* List Attached Files if any */}
            {idea.attachments.length > 0 && (
              <div style={{ marginBottom: "20px", padding: "12px", border: "1px solid var(--line)", borderRadius: "6px", background: "var(--bg)" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--muted)", marginBottom: "8px" }}>Attachments:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {idea.attachments.map((att, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.9rem", padding: "6px 8px", background: "var(--line)", borderRadius: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>📄</span>
                        <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
                          {att.name}
                        </a>
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>({att.size || "1.2 MB"})</span>
                      </div>
                      <button
                        onClick={() => handleDeleteAttachment(idx)}
                        title="Remove attachment"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "1rem" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List Linked Issues if any */}
            {idea.linkedIssues.length > 0 && (
              <div style={{ marginBottom: "20px", padding: "12px", border: "1px solid var(--line)", borderRadius: "6px", background: "var(--bg)" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--muted)", marginBottom: "8px" }}>Linked Issues:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {idea.linkedIssues.map((issue, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "var(--bg)", border: "1px solid var(--accent)", borderRadius: "16px", fontSize: "0.85rem" }}>
                      <span>🔗</span>
                      <a href={issue.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
                        {issue.id}: {issue.title}
                      </a>
                      <button
                        onClick={() => handleDeleteLinkedIssue(idx)}
                        title="Unlink issue"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: "0 2px" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Section */}
            <div style={{ marginBottom: "24px" }}>
              {isEditing ? (
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--muted)", marginBottom: "6px" }}>Idea Summary / Description</label>
                  <textarea
                    rows={6}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    style={{ width: "100%", padding: "12px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)", lineHeight: "1.6", resize: "vertical" }}
                  />
                </div>
              ) : (
                <p style={{ color: "var(--fg)", lineHeight: "1.6", margin: "0", fontSize: "1.05rem", whiteSpace: "pre-line" }}>
                  {idea.description || "No description provided."}
                </p>
              )}
            </div>

            {/* Templates Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
              <button
                className="btn-cancel"
                onClick={() => setTemplateModalOpen(true)}
                style={{ fontSize: "0.85rem", padding: "6px 14px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)", cursor: "pointer" }}
              >
                📑 Templates
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid var(--line)", marginBottom: "32px" }}>
              <div style={getTabStyle("Comments")} onClick={() => setActiveTab("Comments")}>
                Comments
              </div>
              <div style={getTabStyle("Insights")} onClick={() => setActiveTab("Insights")}>
                Insights
              </div>
              <div style={getTabStyle("Delivery")} onClick={() => setActiveTab("Delivery")}>
                Delivery
              </div>
              <div style={getTabStyle("History")} onClick={() => setActiveTab("History")}>
                History
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === "History" && (
                <>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "24px" }}>Progress Timeline</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, borderLeft: "2px solid var(--line)", marginLeft: "8px" }}>
                    <li style={{ position: "relative", paddingLeft: "24px", paddingBottom: "24px" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "-6px",
                          top: "4px",
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: "var(--accent)",
                        }}
                      ></span>
                      <div style={{ fontWeight: "500", fontSize: "1.05rem" }}>Idea Submitted</div>
                      <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                        {idea.created} by {idea.author}
                      </div>
                    </li>
                    <li style={{ position: "relative", paddingLeft: "24px" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "-6px",
                          top: "4px",
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          border: "2px solid var(--accent)",
                          background: "var(--bg)",
                        }}
                      ></span>
                      <div style={{ fontWeight: "500", fontSize: "1.05rem" }}>{idea.statusText}</div>
                      <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Current status in development pipeline</div>
                    </li>
                  </ul>
                </>
              )}

              {activeTab !== "History" && (
                <div
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    color: "var(--muted)",
                    background: "var(--bg)",
                    borderRadius: "8px",
                    border: "1px dashed var(--line)",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🚧</div>
                  <h3 style={{ fontSize: "1.1rem", margin: "0 0 8px 0", color: "var(--fg)" }}>
                    {activeTab} feature coming soon
                  </h3>
                  <p style={{ fontSize: "0.9rem", margin: 0 }}>This section will sync live updates from team members.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Pinned Fields & Details) */}
          <div style={{ flex: 1, minWidth: "280px" }}>
            {/* Pinned fields - TEAM ROW REMOVED */}
            <div style={{ border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden", marginBottom: "24px" }}>
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--bg)",
                  borderBottom: "1px solid var(--line)",
                  fontWeight: 500,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Pinned fields <span>^</span>
              </div>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Goal */}
                <div style={{ display: "flex", flexDirection: isEditing ? "column" : "row", gap: isEditing ? "6px" : "0" }}>
                  <div style={{ width: "120px", color: "var(--muted)", fontSize: "0.95rem", flexShrink: 0 }}>Goal</div>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editForm.goal}
                      onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })}
                      style={{ width: "100%", padding: "8px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
                    />
                  ) : (
                    <div style={{ fontSize: "0.95rem", color: "var(--fg)" }}>{idea.goal || "Not specified"}</div>
                  )}
                </div>

                {/* Updated timestamp */}
                <div style={{ display: "flex" }}>
                  <div style={{ width: "120px", color: "var(--muted)", fontSize: "0.95rem", flexShrink: 0 }}>Updated</div>
                  <div style={{ fontSize: "0.95rem", color: "var(--fg)" }}>{idea.updatedAt}</div>
                </div>

                {/* Roadmap Flowchart */}
                <div style={{ display: "flex", flexDirection: isEditing ? "column" : "row", gap: isEditing ? "6px" : "0" }}>
                  <div style={{ width: "120px", color: "var(--muted)", fontSize: "0.95rem", flexShrink: 0 }}>Roadmap</div>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="e.g. Design -> Prototyping -> Development"
                      value={editForm.roadmap}
                      onChange={(e) => setEditForm({ ...editForm, roadmap: e.target.value })}
                      style={{ width: "100%", padding: "8px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
                    />
                  ) : (
                    <div style={{ fontSize: "0.95rem", color: "var(--fg)", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {roadmapSteps.map((step, idx) => (
                        <span key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              padding: "4px 8px",
                              background: "var(--bg)",
                              border: idx === roadmapSteps.length - 1 ? "1px solid var(--accent)" : "1px solid var(--line)",
                              borderRadius: "4px",
                              fontWeight: idx === roadmapSteps.length - 1 ? 600 : 400,
                              color: idx === roadmapSteps.length - 1 ? "var(--accent)" : "inherit",
                            }}
                          >
                            {step}
                          </span>
                          {idx < roadmapSteps.length - 1 && <span>&rarr;</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Idea Details */}
            <div style={{ border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden", marginBottom: "24px" }}>
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--bg)",
                  borderBottom: "1px solid var(--line)",
                  fontWeight: 500,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Idea details <span>^</span>
              </div>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Creator */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 500 }}>Creator</div>
                  <div style={{ fontSize: "0.95rem" }}>{idea.author}</div>
                </div>

                {/* Collaborators */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 500 }}>Collaborators</div>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="e.g. John Doe, Jane Smith"
                      value={editForm.collaborators}
                      onChange={(e) => setEditForm({ ...editForm, collaborators: e.target.value })}
                      style={{ width: "100%", padding: "8px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
                    />
                  ) : (
                    <div style={{ fontSize: "0.95rem" }}>{idea.collaborators || "None"}</div>
                  )}
                </div>

                {/* Category & Status in Edit mode */}
                {isEditing && (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 500 }}>Category</div>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        style={{ width: "100%", padding: "8px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
                      >
                        <option value="Business">Business</option>
                        <option value="Technology">Technology</option>
                        <option value="Education">Education</option>
                        <option value="Health">Health</option>
                        <option value="Lifestyle">Lifestyle</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 500 }}>Status</div>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        style={{ width: "100%", padding: "8px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
                      >
                        <option value="Proposed">Proposed</option>
                        <option value="In Review">In Review</option>
                        <option value="Approved">Approved</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Repository Link */}
                <div
                  id="repo-link-section"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    transition: "background-color 0.3s ease",
                    padding: "4px",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 500 }}>Repository Link</div>
                  {isEditing ? (
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={editForm.repoUrl}
                      onChange={(e) => setEditForm({ ...editForm, repoUrl: e.target.value })}
                      style={{ width: "100%", padding: "8px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
                    />
                  ) : idea.repoUrl ? (
                    <a href={idea.repoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: "0.95rem", wordBreak: "break-all" }}>
                      {idea.repoUrl}
                    </a>
                  ) : (
                    <span style={{ color: "var(--muted)", fontSize: "0.95rem" }}>N/A</span>
                  )}
                </div>

                {/* In Progress */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 500 }}>In Progress</div>
                  {isEditing ? (
                    <input
                      type="url"
                      placeholder="https://..."
                      value={editForm.inProgressUrl}
                      onChange={(e) => setEditForm({ ...editForm, inProgressUrl: e.target.value })}
                      style={{ width: "100%", padding: "8px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
                    />
                  ) : idea.inProgressUrl ? (
                    <a
                      href={idea.inProgressUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--accent)", fontSize: "0.95rem", wordBreak: "break-all" }}
                    >
                      {idea.inProgressUrl} (Open live product)
                    </a>
                  ) : (
                    <span style={{ color: "var(--muted)", fontSize: "0.95rem" }}>N/A</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attachment Modal */}
      {attachmentModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg)", padding: "24px", borderRadius: "8px", width: "460px", maxWidth: "95vw", border: "1px solid var(--line)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem" }}>📎 Add Attachment</h3>
            <form onSubmit={handleAddAttachment}>
              {/* Local File Dropzone */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--muted)", marginBottom: "6px", fontWeight: 500 }}>
                  Upload / Drop Local File
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: isDragging ? "2px dashed var(--accent)" : "2px dashed var(--line)",
                    borderRadius: "6px",
                    padding: "20px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: isDragging ? "var(--line)" : "transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  {selectedLocalFile ? (
                    <div>
                      <div style={{ fontSize: "1.4rem", marginBottom: "4px" }}>📄</div>
                      <div style={{ fontWeight: 500, fontSize: "0.9rem", color: "var(--fg)" }}>{selectedLocalFile.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "2px" }}>
                        {selectedLocalFile.size > 1024 * 1024
                          ? `${(selectedLocalFile.size / (1024 * 1024)).toFixed(1)} MB`
                          : `${Math.round(selectedLocalFile.size / 1024)} KB`}{" "}
                        • Click or drop to replace
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: "1.4rem", marginBottom: "4px" }}>📁</div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--fg)" }}>
                        Drag &amp; drop a file here, or <span style={{ color: "var(--accent)", textDecoration: "underline" }}>browse</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "4px" }}>
                        Supports PDF, images, docs, and code files
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachment Name */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--muted)", marginBottom: "6px" }}>
                  Attachment Name / Label *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q4_Feature_Specification.pdf"
                  required
                  value={attachmentForm.name}
                  onChange={(e) => setAttachmentForm({ ...attachmentForm, name: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
                />
              </div>

              {/* Optional Drive / Cloud Link */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--muted)", marginBottom: "6px" }}>
                  File URL / Drive Link <span style={{ fontSize: "0.8rem", fontStyle: "italic" }}>(Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or https://..."
                  value={attachmentForm.url}
                  onChange={(e) => setAttachmentForm({ ...attachmentForm, url: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setAttachmentModalOpen(false);
                    setSelectedLocalFile(null);
                  }}
                  style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--line)", borderRadius: "4px", cursor: "pointer", color: "var(--fg)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 16px", background: "var(--accent)", color: "var(--bg)", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 500 }}
                >
                  Attach File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Issue Modal */}
      {linkIssueModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg)", padding: "24px", borderRadius: "8px", width: "420px", border: "1px solid var(--line)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem" }}>🔗 Link Issue</h3>
            <form onSubmit={handleAddLinkedIssue}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--muted)", marginBottom: "6px" }}>Issue ID or Number *</label>
                <input
                  type="text"
                  placeholder="e.g. #108 or ISSUE-42"
                  required
                  value={linkIssueForm.id}
                  onChange={(e) => setLinkIssueForm({ ...linkIssueForm, id: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--muted)", marginBottom: "6px" }}>Issue Title / Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Optimize sales dashboard data loading"
                  value={linkIssueForm.title}
                  onChange={(e) => setLinkIssueForm({ ...linkIssueForm, title: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--muted)", marginBottom: "6px" }}>Issue URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/.../issues/108"
                  value={linkIssueForm.url}
                  onChange={(e) => setLinkIssueForm({ ...linkIssueForm, url: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setLinkIssueModalOpen(false)}
                  style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--line)", borderRadius: "4px", cursor: "pointer", color: "var(--fg)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 16px", background: "var(--accent)", color: "var(--bg)", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 500 }}
                >
                  Link Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {templateModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg)", padding: "24px", borderRadius: "8px", width: "540px", maxHeight: "85vh", overflowY: "auto", border: "1px solid var(--line)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem" }}>📑 Idea Templates</h3>
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "20px" }}>
              Select a structured framework to apply to this idea&apos;s summary:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
              {TEMPLATES.map((tmpl, idx) => (
                <div key={idx} style={{ padding: "14px", border: "1px solid var(--line)", borderRadius: "6px", background: "var(--bg)" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "4px" }}>{tmpl.name}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "10px" }}>{tmpl.description}</div>
                  <pre style={{ background: "var(--line)", padding: "8px", borderRadius: "4px", fontSize: "0.75rem", whiteSpace: "pre-wrap", maxHeight: "80px", overflow: "hidden", margin: "0 0 10px 0" }}>
                    {tmpl.content}
                  </pre>
                  <button
                    onClick={() => handleApplyTemplate(tmpl.content)}
                    style={{ padding: "6px 12px", background: "var(--accent)", color: "var(--bg)", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}
                  >
                    Apply Template
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setTemplateModalOpen(false)}
                style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--line)", borderRadius: "4px", cursor: "pointer", color: "var(--fg)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Alert / Confirmation Modal */}
      {modal.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "var(--bg)",
              padding: "24px",
              borderRadius: "8px",
              minWidth: "400px",
              border: "1px solid var(--line)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 500 }}>{modal.title}</h3>
            {modal.type === "prompt" && (
              <input
                type="text"
                value={modalInput}
                onChange={(e) => setModalInput(e.target.value)}
                placeholder={modal.placeholder}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid var(--line)",
                  borderRadius: "4px",
                  marginBottom: "16px",
                  background: "var(--bg)",
                  color: "var(--fg)",
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && modal.onConfirm) modal.onConfirm(modalInput);
                }}
              />
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: modal.type === "prompt" ? 0 : "24px" }}>
              {(modal.type === "confirm" || modal.type === "prompt") && (
                <button
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  style={{
                    padding: "8px 16px",
                    background: "transparent",
                    border: "1px solid var(--line)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: "var(--fg)",
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => (modal.onConfirm ? modal.onConfirm(modalInput) : setModal({ ...modal, isOpen: false }))}
                style={{
                  padding: "8px 16px",
                  background: "var(--accent)",
                  color: "var(--bg)",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
