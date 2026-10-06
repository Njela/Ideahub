"use client";

import Link from "next/link";
import { useState } from "react";

const IDEAS_DATA = [
  {
    id: 1,
    title: "ACME Customer Sales Product",
    author: "Helga Windle",
    created: "6mo ago",
    statusText: "Proposed",
    statusIcon: "🚀",
    category: "Business",
    icon: "💼",
    votes: 18,
    tags: ["Increase Innovation"]
  },
  {
    id: 2,
    title: "Green roof on HQ",
    author: "Troy Mccoy (Team Member)",
    created: "9mo ago",
    statusText: "In Review",
    statusIcon: "ℹ️",
    category: "Health",
    icon: "🌿",
    votes: 10,
    tags: ["Increase Innovation"]
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Ideas");
  const [statusFilter, setStatusFilter] = useState("Any status");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [sortBy, setSortBy] = useState("Most recent");

  // Mock current user for demonstration purposes
  const CURRENT_USER = "Helga Windle";

  const filteredIdeas = IDEAS_DATA.filter((idea) => {
    // 1. Filter by Tab
    if (activeTab === "My Ideas" && idea.author !== CURRENT_USER) return false;
    
    // 2. Filter by Status
    if (statusFilter !== "Any status" && idea.statusText !== statusFilter) return false;

    // 3. Filter by Category
    if (categoryFilter !== "All categories" && idea.category !== categoryFilter) return false;

    // 4. Filter by Search Query
    const matchesSearch = 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.author.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "Oldest") {
      return a.id - b.id; // Using ID as proxy for age
    }
    return b.id - a.id; // Most recent
  });

  return (
    <div className="ideas-layout">
      <div className="main-content">
        <div className="page-header" style={{justifyContent: 'flex-end'}}>
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
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
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>Any status</option>
              <option>Proposed</option>
              <option>In Review</option>
              <option>Approved</option>
              <option>In Progress</option>
              <option>Done</option>
              <option>Shelved</option>
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

        {filteredIdeas.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
            No ideas found matching "{searchQuery}"
          </div>
        ) : (
          <ul className="idea-list">
            {filteredIdeas.map((idea) => (
              <li className="idea-item" key={idea.id}>
                <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '8px', flexShrink: 0 }}>
                  {idea.icon}
                </div>
                <div className="idea-details">
                  <h3><Link href={`/ideas/${idea.id}`} style={{textDecoration: 'none', color: 'inherit'}}>{idea.title}</Link></h3>
                  <div className="idea-meta">
                    by {idea.author} • Created {idea.created} • <span className="status"><span className="status-icon">{idea.statusIcon}</span> {idea.statusText}</span>
                  </div>
                  <div className="idea-tags">
                    <span className="tag" style={{ background: 'var(--accent)', color: 'var(--bg)' }}>{idea.category}</span>
                    {idea.tags.map(tag => (
                      <span className="tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="sidebar">
        <div className="share-idea">
          <p>Have an Idea? Share it!</p>
          <Link href="/ideas/new"><button className="create-btn">Create an Idea</button></Link>
        </div>
      </div>
    </div>
  );
}
