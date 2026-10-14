"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AppSidebar({ isOpen = false, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: "🏠" },
    { label: "Archive", href: "/archive", icon: "🗄️" },
    { label: "Profile", href: "/profile", icon: "👤" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
        />
      )}

      <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
        {/* Brand / Logo */}
        <div className="sidebar-brand">
          <Link href="/" className="sidebar-brand-link" onClick={onClose}>
            <div className="sidebar-logo-wrapper">
              <img
                src="/logo.png"
                alt="IdeaHub Logo"
                className="sidebar-logo-img"
              />
            </div>
            <span className="sidebar-brand-title">IdeaHub</span>
          </Link>
          {onClose && (
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
              ✕
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className="sidebar-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="sidebar-quick-actions">
          <span className="quick-actions-title">Quick Actions</span>
          <Link
            href="/ideas/new"
            onClick={onClose}
            className="sidebar-create-btn"
          >
            <span>+</span> Create an Idea
          </Link>
        </div>

        {/* Bottom Graphic / Illustration matching Mockup */}
        <div className="sidebar-bottom-illustration">
          <div className="glowing-bulb-container">
            <div className="bulb-glow-circle">💡</div>
            <div className="team-silhouette-dots">👥</div>
          </div>
          <div className="illustration-text">
            <span>Collaborate &amp; Innovate</span>
          </div>
        </div>
      </aside>
    </>
  );
}
