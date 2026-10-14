"use client";

import { useState } from "react";
import AppSidebar from "./AppSidebar";
import AppTopHeader from "./AppTopHeader";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <AppSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="workspace-wrapper">
        <AppTopHeader
          onToggleSidebar={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="main-content-scroll">{children}</main>
      </div>
    </div>
  );
}
