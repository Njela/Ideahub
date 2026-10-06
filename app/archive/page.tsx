"use client";

import Link from "next/link";
import { useState } from "react";

export default function ArchivePage() {
  const [archivedIdeas, setArchivedIdeas] = useState([
    { id: 3, title: "Legacy Database Migration", author: "Bess Marso", date: "Jan 12, 2022" },
    { id: 4, title: "Virtual Reality Onboarding", author: "Troy Mccoy", date: "Mar 05, 2021" }
  ]);

  const [message, setMessage] = useState("");

  const handleUnarchive = (id: number, title: string) => {
    setArchivedIdeas(archivedIdeas.filter(idea => idea.id !== id));
    setMessage(`"${title}" has been successfully unarchived! It is now back in the main list.`);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="ideas-layout">
      <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Archive Box 🗄️</h1>
          <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>&larr; Back to all ideas</Link>
        </div>
        
        <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>This is where archived and shelved ideas live. You can restore them at any time.</p>

        {message && (
          <div style={{ padding: '12px 16px', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '24px', border: '1px solid #c3e6cb' }}>
            {message}
          </div>
        )}

        {archivedIdeas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--line)', borderRadius: '8px', color: 'var(--muted)' }}>
            Nothing here right now!
          </div>
        ) : (
          <ul className="idea-list">
            {archivedIdeas.map(idea => (
              <li className="idea-item" key={idea.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="idea-details">
                  <h3 style={{ margin: '0 0 8px 0' }}>{idea.title}</h3>
                  <div className="idea-meta" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Archived on {idea.date} by {idea.author}
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => handleUnarchive(idea.id, idea.title)}
                    style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Unarchive
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
