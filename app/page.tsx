"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getIdeas } from "@/app/actions";

type IdeaItem = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  goal: string;
  roadmap: string;
  description: string;
  author: string;
  created: string;
  createdAt: string;
  statusText: string;
  statusIcon: string;
  category: string;
  icon: string;
  votes: number;
  tags: string[];
  collaborators: string;
  repoUrl: string;
  inProgressUrl: string;
};

const RECENT_ACTIVITIES = [
  {
    id: 1,
    type: "create",
    badge: "+",
    badgeBg: "#6366f1",
    actor: "Angela",
    action: "created a new idea",
    target: "Operations",
    time: "1h ago",
  },
  {
    id: 2,
    type: "status",
    badge: "✓",
    badgeBg: "#10b981",
    actor: "Bess",
    action: "updated the status",
    target: "Legacy Database Migration",
    time: "3h ago",
  },
  {
    id: 3,
    type: "comment",
    badge: "💬",
    badgeBg: "#3b82f6",
    actor: "Mark",
    action: "commented on an idea",
    target: "API Integration",
    time: "5h ago",
  },
  {
    id: 4,
    type: "archive",
    badge: "🗄️",
    badgeBg: "#8b5a2b",
    actor: "You",
    action: "archived an idea",
    target: "Old Analytics Pipeline",
    time: "1d ago",
  },
];

export default function Home() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Ideas");
  const [statusFilter, setStatusFilter] = useState("Any status");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [sortBy, setSortBy] = useState("Most recent");

  // Current user for demonstration purposes
  const CURRENT_USER = "Helga Windle";

  useEffect(() => {
    async function loadIdeas() {
      try {
        const data = await getIdeas();
        setIdeas(data);
      } catch (err) {
        console.error("Failed to load ideas:", err);
      } finally {
        setLoading(false);
      }
    }
    loadIdeas();
  }, []);

  const filteredIdeas = ideas
    .filter((idea) => {
      // 1. Filter by Tab
      if (
        activeTab === "My Ideas" &&
        !idea.author.toLowerCase().includes(CURRENT_USER.toLowerCase())
      ) {
        return false;
      }

      // 2. Filter by Status
      if (
        statusFilter !== "Any status" &&
        idea.statusText.toLowerCase() !== statusFilter.toLowerCase()
      ) {
        return false;
      }

      // 3. Filter by Category
      if (
        categoryFilter !== "All categories" &&
        idea.category.toLowerCase() !== categoryFilter.toLowerCase()
      ) {
        return false;
      }

      // 4. Filter by Search Query
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        idea.title.toLowerCase().includes(query) ||
        idea.author.toLowerCase().includes(query) ||
        idea.code.toLowerCase().includes(query) ||
        idea.category.toLowerCase().includes(query);

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "Oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div>
      {/* 1. Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h2>
            Turn ideas into <span className="highlight">impactful solutions</span>
          </h2>
          <p className="hero-subtitle">Collaborate • Build • Make it real</p>
        </div>

        <div className="hero-quote-box">
          <span className="hero-quote-icon">💡</span>
          <span className="hero-quote-text">
            &ldquo;Great ideas start with a thought.&rdquo;
          </span>
        </div>
      </section>

      {/* 2. Tabs & Action Bar */}
      <div className="main-action-row">
        <div className="hero-tabs">
          <div
            className={`hero-tab ${activeTab === "All Ideas" ? "active" : ""}`}
            onClick={() => setActiveTab("All Ideas")}
          >
            All Ideas
          </div>
          <div
            className={`hero-tab ${activeTab === "My Ideas" ? "active" : ""}`}
            onClick={() => setActiveTab("My Ideas")}
          >
            My Ideas
          </div>
        </div>
      </div>

      {/* 3. Filter Pills Bar */}
      <div className="filter-pills-row">
        {/* Status Pill */}
        <div className="filter-pill-card">
          <label>Status</label>
          <div className="filter-pill-select-wrapper">
            <span>🏷️</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                if (e.target.value === "Archived") {
                  router.push("/archive");
                } else {
                  setStatusFilter(e.target.value);
                }
              }}
            >
              <option>Any status</option>
              <option>Proposed</option>
              <option>In Review</option>
              <option>Approved</option>
              <option>In Progress</option>
              <option>Done</option>
              <option>Archived</option>
            </select>
          </div>
        </div>

        {/* Category Pill */}
        <div className="filter-pill-card">
          <label>Category</label>
          <div className="filter-pill-select-wrapper">
            <span>📁</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option>All categories</option>
              <option>Business</option>
              <option>Technology</option>
              <option>Education</option>
              <option>Health</option>
              <option>Lifestyle</option>
            </select>
          </div>
        </div>

        {/* Sort Pill */}
        <div className="filter-pill-card">
          <label>Sort by</label>
          <div className="filter-pill-select-wrapper">
            <span>📶</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Most recent</option>
              <option>Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Main Content Feed */}
      <div className="two-column-feed">
        {/* Left Column: Idea Cards */}
        <div className="ideas-feed-column">
          {loading ? (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                color: "var(--muted)",
                background: "var(--bg)",
                border: "1px solid var(--line)",
                borderRadius: "10px",
              }}
            >
              Loading ideas from database...
            </div>
          ) : filteredIdeas.length === 0 ? (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                color: "var(--muted)",
                background: "var(--bg)",
                border: "1px dashed var(--line)",
                borderRadius: "10px",
              }}
            >
              No ideas found matching your filter criteria.
            </div>
          ) : (
            filteredIdeas.map((idea) => (
              <Link
                key={idea.id}
                href={`/ideas/${idea.id}`}
                className="idea-feed-card"
              >
                <div className="card-left">
                  <div className="card-icon-box">{idea.icon}</div>
                  <div className="card-content">
                    <h3 className="card-title">{idea.title}</h3>
                    <div className="card-meta">
                      <span>by {idea.author}</span>
                      <span>•</span>
                      <span>Created {idea.created}</span>
                      <span>•</span>
                      <span>
                        {idea.statusIcon} {idea.statusText}
                      </span>
                    </div>
                    <div className="card-tags">
                      <span className="category-badge">{idea.category}</span>
                      {idea.tags.map((tag, idx) => (
                        <span key={idx} className="tag-pill">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card-right-action" title="Open idea details">
                  &rarr;
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="recent-activity-card">
          <div className="activity-header">
            <span>⚡</span>
            <span>Recent Activity</span>
          </div>

          <div className="activity-timeline">
            {RECENT_ACTIVITIES.map((act) => (
              <div key={act.id} className="activity-item">
                <div
                  className="activity-icon-badge"
                  style={{ background: act.badgeBg }}
                >
                  {act.badge}
                </div>
                <div className="activity-details">
                  <div className="activity-text">
                    <strong>{act.actor}</strong> {act.action}{" "}
                    <span style={{ color: "var(--accent)", fontWeight: 500 }}>
                      {act.target}
                    </span>
                  </div>
                  <span className="activity-time">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
