"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getIdeaById, archiveIdea, moveIdea, mergeIdeas } from "@/app/actions";

type ModalState = {
  isOpen: boolean;
  title: string;
  type: "alert" | "prompt" | "confirm";
  placeholder?: string;
  onConfirm?: (val?: string) => void;
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
};

export default function IdeaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("History");
  const [modal, setModal] = useState<ModalState>({ isOpen: false, title: "", type: "alert" });
  const [modalInput, setModalInput] = useState("");

  useEffect(() => {
    async function loadIdea() {
      try {
        const data = await getIdeaById(params.id);
        setIdea(data);
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
    if (updated) setIdea(updated);
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

  const handleAction = (action: string) => {
    setModal({ isOpen: true, title: `${action} functionality would open here.`, type: "alert" });
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

  const roadmapSteps = idea.roadmap ? idea.roadmap.split("->").map((s) => s.trim()) : ["Design", "Prototyping", "Development"];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px" }}>
      <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "16px", marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "8px" }}>
              <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
                All ideas
              </Link>{" "}
              / <span style={{ color: "var(--accent)" }}>{idea.icon}</span> {idea.code}
            </div>
            <h2 style={{ fontSize: "2rem", margin: 0 }}>{idea.title}</h2>
          </div>

          <div style={{ display: "flex", gap: "16px", fontSize: "0.9rem" }}>
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
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "40px" }}>
        {/* Left Column */}
        <div style={{ flex: 2 }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            <button
              className="btn-cancel"
              onClick={() => handleAction("Add attachment")}
              style={{ fontSize: "0.85rem", display: "flex", gap: "8px", alignItems: "center" }}
            >
              <span>📎</span> Add attachment
            </button>
            <button
              className="btn-cancel"
              onClick={() => handleAction("Link issue")}
              style={{ fontSize: "0.85rem", display: "flex", gap: "8px", alignItems: "center" }}
            >
              <span>🔗</span> Link issue
            </button>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <p style={{ color: "var(--fg)", lineHeight: "1.6", margin: "0", fontSize: "1.05rem" }}>
              {idea.description || "No description provided."}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
            <button className="btn-cancel" style={{ fontSize: "0.85rem" }}>
              📑 Templates
            </button>
          </div>

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

        {/* Right Column (Pinned Fields) */}
        <div style={{ flex: 1 }}>
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
              <div style={{ display: "flex" }}>
                <div style={{ width: "120px", color: "var(--muted)", fontSize: "0.95rem", flexShrink: 0 }}>Goal</div>
                <div style={{ fontSize: "0.95rem", color: "var(--fg)" }}>{idea.goal || "Not specified"}</div>
              </div>
              <div style={{ display: "flex" }}>
                <div style={{ width: "120px", color: "var(--muted)", fontSize: "0.95rem", flexShrink: 0 }}>Updated</div>
                <div style={{ fontSize: "0.95rem", color: "var(--fg)" }}>{idea.updatedAt}</div>
              </div>
              <div style={{ display: "flex" }}>
                <div style={{ width: "120px", color: "var(--muted)", fontSize: "0.95rem", flexShrink: 0 }}>Roadmap</div>
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
              </div>
              <div style={{ display: "flex" }}>
                <div style={{ width: "120px", color: "var(--muted)", fontSize: "0.95rem", flexShrink: 0 }}>Team</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                  <span style={{ background: "var(--bg)", color: "var(--accent)", border: "1px solid var(--line)", padding: "2px 8px", borderRadius: "4px" }}>
                    🍊 {idea.team || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>
          </div>

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
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 500 }}>Creator</div>
                <div style={{ fontSize: "0.95rem" }}>{idea.author}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 500 }}>Collaborators</div>
                <div style={{ fontSize: "0.95rem" }}>{idea.collaborators || "None"}</div>
              </div>
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
                {idea.repoUrl ? (
                  <a href={idea.repoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: "0.95rem", wordBreak: "break-all" }}>
                    {idea.repoUrl}
                  </a>
                ) : (
                  <span style={{ color: "var(--muted)", fontSize: "0.95rem" }}>N/A</span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 500 }}>In Progress</div>
                {idea.inProgressUrl ? (
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
