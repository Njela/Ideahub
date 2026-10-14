"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function AppSidebar({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: AppSidebarProps) {
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

      <aside
        className={`app-sidebar ${isOpen ? "open" : ""} ${
          isCollapsed ? "collapsed" : ""
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="sidebar-brand">
          <Link
            href="/"
            className="sidebar-brand-link"
            onClick={isCollapsed ? (e) => { e.preventDefault(); onToggleCollapse?.(); } : onClose}
            title={isCollapsed ? "Click to expand sidebar" : "IdeaHub Home"}
          >
            <div className="sidebar-logo-wrapper">
              <img
                src="/logo.png"
                alt="IdeaHub Logo"
                className="sidebar-logo-img"
              />
            </div>
            {!isCollapsed && <span className="sidebar-brand-title">IdeaHub</span>}
          </Link>

          {/* Toggle Button (Collapse / Expand) */}
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? "▶" : "◀"}
          </button>

          {/* Mobile Close Button */}
          {isOpen && onClose && (
            <button
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content only visible when sidebar is expanded */}
        {!isCollapsed && (
          <div className="sidebar-expanded-content">
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

            {/* Quick Actions (The only Create Idea button) */}
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

            {/* Bottom Graphic / Illustration */}
            <div className="sidebar-bottom-illustration">
              <div className="glowing-bulb-container">
                <div className="bulb-glow-circle">💡</div>
                <div className="team-silhouette-dots">👥</div>
              </div>
              <div className="illustration-text">
                <span>Collaborate &amp; Innovate</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
