"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    firstName: "Helga",
    lastName: "Windle",
    email: "helga.windle@example.com",
    role: "Product Manager",
    department: "Sales & Marketing",
    bio: "Passionate about creating tools that help our customers succeed.",
  });

  const [settings, setSettings] = useState({
    theme: "light",
    notifications: true,
    emailDigest: "weekly",
    language: "english",
    visibility: "public",
  });

  const [savedMessage, setSavedMessage] = useState("");

  // Load saved theme and profile on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        setSettings((s) => ({ ...s, theme: savedTheme }));
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setSettings((s) => ({ ...s, theme: "dark" }));
      }

      const savedProfile = localStorage.getItem("profileData");
      if (savedProfile) {
        setProfileData(JSON.parse(savedProfile));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setSettings((s) => ({ ...s, theme: newTheme }));

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      localStorage.removeItem("theme");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("profileData", JSON.stringify(profileData));
      localStorage.setItem("platformSettings", JSON.stringify(settings));
    } catch (err) {
      console.error(err);
    }
    setSavedMessage("Profile and platform settings saved successfully! ✨");
    setTimeout(() => setSavedMessage(""), 4000);
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", width: "100%" }}>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", margin: 0 }}>👤 Profile &amp; Settings</h1>
      </div>

        {savedMessage && (
          <div
            style={{
              padding: "12px 16px",
              background: "#d4edda",
              color: "#155724",
              borderRadius: "6px",
              marginBottom: "24px",
              border: "1px solid #c3e6cb",
              fontWeight: 500,
            }}
          >
            {savedMessage}
          </div>
        )}

        <form onSubmit={handleSave} style={{ background: "var(--bg)", padding: "32px", borderRadius: "8px", border: "1px solid var(--line)" }}>
          {/* SECTION 1: Team Member Details */}
          <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid var(--line)", paddingBottom: "10px", marginBottom: "24px", color: "var(--fg)" }}>
            Team Member Details
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div className="filter-group">
              <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.85rem", fontWeight: 500 }}>First Name</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
              />
            </div>
            <div className="filter-group">
              <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.85rem", fontWeight: 500 }}>Last Name</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.85rem", fontWeight: 500 }}>Email Address</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div className="filter-group">
              <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.85rem", fontWeight: 500 }}>Role</label>
              <input
                type="text"
                value={profileData.role}
                onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
              />
            </div>
            <div className="filter-group">
              <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.85rem", fontWeight: 500 }}>Department</label>
              <select
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
              >
                <option>Sales &amp; Marketing</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>Human Resources</option>
                <option>Operations</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "36px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.85rem", fontWeight: 500 }}>Bio</label>
            <textarea
              rows={3}
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)", resize: "vertical" }}
            ></textarea>
          </div>

          {/* SECTION 2: Platform Settings & Appearance */}
          <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid var(--line)", paddingBottom: "10px", marginBottom: "24px", color: "var(--fg)" }}>
            ⚙️ Platform Settings &amp; Preferences
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.85rem", fontWeight: 500 }}>
                Theme Appearance
              </label>
              <select
                value={settings.theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
              >
                <option value="light">Light Theme (Warm Wooden)</option>
                <option value="dark">Dark Theme</option>
                <option value="system">System Default</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.85rem", fontWeight: 500 }}>Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
              >
                <option value="english">English (US)</option>
                <option value="spanish">Español</option>
                <option value="french">Français</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              type="checkbox"
              id="notif"
              checked={settings.notifications}
              onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label htmlFor="notif" style={{ fontSize: "0.95rem", cursor: "pointer" }}>
              Enable push notifications for new team ideas and updates
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.85rem", fontWeight: 500 }}>Email Digest</label>
              <select
                value={settings.emailDigest}
                onChange={(e) => setSettings({ ...settings, emailDigest: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
              >
                <option value="daily">Daily Summary</option>
                <option value="weekly">Weekly Summary</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "var(--muted)", fontSize: "0.85rem", fontWeight: 500 }}>Default Idea Visibility</label>
              <select
                value={settings.visibility}
                onChange={(e) => setSettings({ ...settings, visibility: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid var(--line)", borderRadius: "4px", background: "var(--bg)", color: "var(--fg)" }}
              >
                <option value="public">Public (Entire Company)</option>
                <option value="private">Private (Only my department)</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
            <Link
              href="/"
              style={{
                padding: "10px 24px",
                border: "1px solid var(--line)",
                borderRadius: "4px",
                textDecoration: "none",
                color: "inherit",
                fontWeight: 500,
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              style={{
                padding: "10px 24px",
                background: "var(--accent)",
                color: "var(--bg)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Save Profile &amp; Settings
            </button>
          </div>
        </form>
    </div>
  );
}
