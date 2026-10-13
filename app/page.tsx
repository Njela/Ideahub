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
  team: string;
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
      if (activeTab === "My Ideas" && !idea.author.toLowerCase().includes(CURRENT_USER.toLowerCase())) {
        return false;
      }

      // 2. Filter by Status
      if (statusFilter !== "Any status" && idea.statusText.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // 3. Filter by Category
      if (categoryFilter !== "All categories" && idea.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      // 4. Filter by Search Query
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        idea.title.toLowerCase().includes(query) ||
        idea.author.toLowerCase().includes(query) ||
        idea.code.toLowerCase().includes(query);

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "Oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="ideas-layout">
      <div className="main-content">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <Link
            href="/ideas/new"
            className="create-btn"
            style={{
              padding: "10px 24px",
              background: "var(--accent)",
              color: "var(--bg)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Create an Idea
          </Link>
        </div>

        <div className="tabs">
          <div
            className={`tab ${activeTab === "All Ideas" ? "active" : ""}`}
            onClick={() => setActiveTab("All Ideas")}
          >
            All Ideas
          </div>
          <div
            className={`tab ${activeTab === "My Ideas" ? "active" : ""}`}
            onClick={() => setActiveTab("My Ideas")}
          >
            My Ideas
          </div>
        </div>

        <div className="filters-bar">
          <div className="filter-group">
            <label>Status</label>
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
          <div className="filter-group">
            <label>Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option>All categories</option>
              <option>Business</option>
              <option>Technology</option>
              <option>Education</option>
              <option>Health</option>
              <option>Lifestyle</option>
            </select>
          </div>
          <div className="filter-group sort-by">
            <label>Sort by</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option>Most recent</option>
              <option>Oldest</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            Loading ideas from database...
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            No ideas found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          <ul className="idea-list">
            {filteredIdeas.map((idea) => (
              <li className="idea-item" key={idea.id}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.5rem",
                    background: "var(--bg)",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    flexShrink: 0,
                  }}
                >
                  {idea.icon}
                </div>
                <div className="idea-details">
                  <h3>
                    <Link href={`/ideas/${idea.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      {idea.title}
                    </Link>
                  </h3>
                  <div className="idea-meta">
                    by {idea.author} • Created {idea.created} •{" "}
                    <span className="status">
                      <span className="status-icon">{idea.statusIcon}</span> {idea.statusText}
                    </span>
                  </div>
                  <div className="idea-tags">
                    <span className="tag" style={{ background: "var(--accent)", color: "var(--bg)" }}>
                      {idea.category}
                    </span>
                    {idea.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
