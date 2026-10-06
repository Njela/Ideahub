"use client";

import { useState } from "react";
import Link from "next/link";

export default function IdeaPage({ params }: { params: { id: string } }) {
  const isACME = params.id === '1' || params.id === 'ACME';
  const [activeTab, setActiveTab] = useState('History');
  
  const handleAction = (action: string) => {
    alert(`${action} functionality would open here.`);
  };

  const getTabStyle = (tabName: string) => {
    return activeTab === tabName 
      ? { paddingBottom: '8px', cursor: 'pointer', color: 'var(--accent)', fontWeight: 500, borderBottom: '2px solid var(--accent)' }
      : { paddingBottom: '8px', cursor: 'pointer', color: 'var(--muted)', fontWeight: 500 };
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px' }}>
      <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '8px' }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>All ideas</Link> / <span style={{ color: 'var(--accent)' }}>💡</span> {isACME ? 'AWE-222' : 'AWE-223'}
            </div>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>{isACME ? 'ACME Customer Sales Product' : 'Green roof on HQ'}</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem' }}>
            <button className="action-link" onClick={() => handleAction('Move')}>Move</button>
            <button className="action-link" onClick={() => handleAction('Clone')}>Clone</button>
            <button className="action-link" onClick={() => handleAction('Merge')}>Merge</button>
            <button className="action-link" onClick={() => handleAction('Archive')}>Archive</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '40px' }}>
        {/* Left Column */}
        <div style={{ flex: 2 }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button className="btn-cancel" onClick={() => handleAction('Add attachment')} style={{ fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}><span>📎</span> Add attachment</button>
            <button className="btn-cancel" onClick={() => handleAction('Link issue')} style={{ fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}><span>🔗</span> Link issue</button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: '#444', lineHeight: '1.6', margin: '0', fontSize: '1.05rem' }}>
              {isACME 
                ? 'This idea focuses on developing a tailored sales product for ACME customers to boost engagement and retention. It includes a unified dashboard, automated follow-ups, and AI-driven insights.'
                : 'Proposing the installation of a green roof on the main headquarters building. This will improve building insulation, reduce urban heat island effect, and provide a recreational space for employees.'}
            </p>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
            <button className="btn-cancel" style={{ fontSize: '0.85rem' }}>📑 Templates</button>
          </div>

          <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--line)', marginBottom: '32px' }}>
            <div style={getTabStyle('Comments')} onClick={() => setActiveTab('Comments')}>Comments</div>
            <div style={getTabStyle('Insights')} onClick={() => setActiveTab('Insights')}>Insights</div>
            <div style={getTabStyle('Delivery')} onClick={() => setActiveTab('Delivery')}>Delivery</div>
            <div style={getTabStyle('History')} onClick={() => setActiveTab('History')}>History</div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'History' && (
              <>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>Progress Timeline</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderLeft: '2px solid var(--line)', marginLeft: '8px' }}>
              <li style={{ position: 'relative', paddingLeft: '24px', paddingBottom: '24px' }}>
                <span style={{ position: 'absolute', left: '-6px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }}></span>
                <div style={{ fontWeight: '500', fontSize: '1.05rem' }}>Idea Submitted</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  {isACME ? '6 months ago by Helga Windle' : '9 months ago by Troy Mccoy'}
                </div>
              </li>
              {isACME && (
                <li style={{ position: 'relative', paddingLeft: '24px' }}>
                  <span style={{ position: 'absolute', left: '-6px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--line)', background: 'white' }}></span>
                  <div style={{ fontWeight: '500', fontSize: '1.05rem' }}>In Review</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Pending approval from product team</div>
                </li>
              )}
              {!isACME && (
                <li style={{ position: 'relative', paddingLeft: '24px' }}>
                  <span style={{ position: 'absolute', left: '-6px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--accent)', background: 'white' }}></span>
                  <div style={{ fontWeight: '500', fontSize: '1.05rem' }}>Information Requested</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Facilities management requested cost estimates</div>
                </li>
              )}
            </ul>
            </>
          )}

          {activeTab !== 'History' && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', background: '#f5f0eb', borderRadius: '8px', border: '1px dashed var(--line)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🚧</div>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px 0', color: '#333' }}>{activeTab} feature coming soon</h3>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>This tab is currently being wired up to the backend.</p>
            </div>
          )}
          </div>
        </div>

        {/* Right Column (Pinned Fields) */}
        <div style={{ flex: 1 }}>
          <div style={{ border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '12px 16px', background: '#f9f9f9', borderBottom: '1px solid var(--line)', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Pinned fields <span>^</span>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '120px', color: 'var(--muted)', fontSize: '0.95rem', flexShrink: 0 }}>Goal</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--fg)' }}>{isACME ? 'Provide a unified dashboard to increase customer retention by 15%.' : 'Reduce energy costs and provide a recreational space for employees.'}</div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '120px', color: 'var(--muted)', fontSize: '0.95rem', flexShrink: 0 }}>Updated</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--fg)' }}>Oct 24, 2023 01:06 PM</div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '120px', color: 'var(--muted)', fontSize: '0.95rem', flexShrink: 0 }}>Roadmap</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '4px 8px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px' }}>Design</span>
                  <span>&rarr;</span>
                  <span style={{ padding: '4px 8px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px' }}>Prototyping</span>
                  <span>&rarr;</span>
                  <span style={{ padding: '4px 8px', background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: '4px', fontWeight: 500, color: 'var(--accent)' }}>Development</span>
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '120px', color: 'var(--muted)', fontSize: '0.95rem', flexShrink: 0 }}>Team</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}><span style={{ background: '#f5f0eb', color: '#5c3a21', border: '1px solid #e6dfd5', padding: '2px 8px', borderRadius: '4px' }}>🍊 Orange</span></div>
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--line)', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Idea details <span>^</span>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 500 }}>Creator</div>
                <div style={{ fontSize: '0.95rem' }}>{isACME ? 'Helga Windle' : 'Troy Mccoy'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 500 }}>Collaborators</div>
                <div style={{ fontSize: '0.95rem' }}>{isACME ? 'Adela Cervantsz, Bess Marso' : 'Jane Doe, John Smith'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 500 }}>Repository Link</div>
                <a href="#" style={{ color: 'var(--accent)', fontSize: '0.95rem', wordBreak: 'break-all' }}>{isACME ? 'https://github.com/acme/sales' : 'N/A'}</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 500 }}>In Progress</div>
                <a href={isACME ? "https://acme.dev" : "#"} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.95rem', wordBreak: 'break-all' }}>{isACME ? 'https://acme.dev (Open live product)' : 'N/A'}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
