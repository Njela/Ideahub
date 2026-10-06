"use client";

import Link from "next/link";
import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: "light",
    notifications: true,
    emailDigest: "weekly",
    language: "english",
    visibility: "public"
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings updated successfully!");
  };

  return (
    <div className="ideas-layout">
      <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div className="page-header">
          <h1>Platform Settings</h1>
        </div>

        <form onSubmit={handleSave} style={{ background: 'white', padding: '32px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          
          <h3 style={{ borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '24px' }}>Preferences</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>Theme</label>
              <select 
                value={settings.theme}
                onChange={e => setSettings({...settings, theme: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', background: 'white' }}
              >
                <option value="light">Light Theme (Wooden)</option>
                <option value="dark">Dark Theme</option>
                <option value="system">System Default</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>Language</label>
              <select 
                value={settings.language}
                onChange={e => setSettings({...settings, language: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', background: 'white' }}
              >
                <option value="english">English (US)</option>
                <option value="spanish">Español</option>
                <option value="french">Français</option>
              </select>
            </div>
          </div>

          <h3 style={{ borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '24px', marginTop: '32px' }}>Notifications</h3>

          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input 
              type="checkbox" 
              id="notif" 
              checked={settings.notifications} 
              onChange={e => setSettings({...settings, notifications: e.target.checked})}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="notif" style={{ fontSize: '1.05rem', cursor: 'pointer' }}>Enable push notifications for new ideas</label>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>Email Digest</label>
            <select 
              value={settings.emailDigest}
              onChange={e => setSettings({...settings, emailDigest: e.target.value})}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', background: 'white' }}
            >
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Summary</option>
              <option value="never">Never</option>
            </select>
          </div>

          <h3 style={{ borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '24px', marginTop: '32px' }}>Privacy</h3>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>Default Idea Visibility</label>
            <select 
              value={settings.visibility}
              onChange={e => setSettings({...settings, visibility: e.target.value})}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '4px', background: 'white' }}
            >
              <option value="public">Public (Entire Company)</option>
              <option value="private">Private (Only my team)</option>
            </select>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '8px' }}>This sets the default visibility when you create a new idea.</p>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <Link href="/" style={{ padding: '10px 24px', border: '1px solid var(--line)', borderRadius: '4px', textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>Cancel</Link>
            <button type="submit" style={{ padding: '10px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
}
