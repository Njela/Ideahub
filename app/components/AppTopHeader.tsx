"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface AppTopHeaderProps {
  onToggleSidebar?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  isSidebarCollapsed?: boolean;
}

export default function AppTopHeader({
  onToggleSidebar,
  searchQuery = "",
  onSearchChange,
  isSidebarCollapsed = false,
}: AppTopHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [internalQuery, setInternalQuery] = useState(searchQuery);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalQuery(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  return (
    <header className="app-top-header">
      {/* Sidebar Toggle Button */}
      <button
        type="button"
        className="header-sidebar-toggle mobile-sidebar-toggle"
        onClick={onToggleSidebar}
        aria-label="Toggle Navigation Menu"
        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        ☰
      </button>

      {/* Global Search Box */}
      <div className="top-search-box">
        <span className="search-glass-icon">🔍</span>
        <input
          type="text"
          placeholder="Search ideas, categories, or keywords..."
          value={onSearchChange ? searchQuery : internalQuery}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && pathname !== "/") {
              router.push(`/?search=${encodeURIComponent(internalQuery)}`);
            }
          }}
        />
        <span className="shortcut-badge">⌘K</span>
      </div>

      {/* Right Controls */}
      <div className="top-header-right">
        {/* Notification Bell */}
        <div className="notification-bell-btn" title="Notifications">
          <span className="bell-icon">🔔</span>
          <span className="notification-dot" />
        </div>

        {/* User Profile Avatar */}
        <Link href="/profile" className="top-user-avatar" title="View Profile">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
            alt="User Avatar"
            className="avatar-img"
          />
        </Link>
      </div>
    </header>
  );
}
