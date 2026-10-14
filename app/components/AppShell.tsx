"use client";

import { useState, useEffect } from "react";
import AppSidebar from "./AppSidebar";
import AppTopHeader from "./AppTopHeader";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ideahub_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch (e) {}
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ideahub_sidebar_collapsed", String(next));
      } catch (e) {}
      return next;
    });
  };

  const handleHeaderToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 1024) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      handleToggleCollapse();
    }
  };

  return (
    <div className={`app-shell ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <AppSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <div className="workspace-wrapper">
        <AppTopHeader
          onToggleSidebar={handleHeaderToggle}
          isSidebarCollapsed={isCollapsed}
        />
        <main className="main-content-scroll">{children}</main>
      </div>
    </div>
  );
}
