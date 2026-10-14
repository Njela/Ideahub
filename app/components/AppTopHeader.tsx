"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { searchIdeas } from "@/app/actions";

interface SuggestedIdea {
  id: string;
  code: string;
  title: string;
  author: string;
  category: string;
  statusText: string;
  icon: string;
  statusIcon: string;
}

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
  const [suggestions, setSuggestions] = useState<SuggestedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internalQuery if parent searchQuery prop changes
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== internalQuery) {
      setInternalQuery(searchQuery);
    }
  }, [searchQuery]);

  // Click outside to close suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  // Query suggestions on typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalQuery(val);
    setSelectedIndex(-1);

    if (onSearchChange) {
      onSearchChange(val);
    }

    if (!val.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsDropdownOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchIdeas(val);
        setSuggestions(results);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 120);
  };

  const handleSelectIdea = (ideaId: string) => {
    setIsDropdownOpen(false);
    router.push(`/ideas/${ideaId}`);
  };

  const handleSearchSubmit = () => {
    setIsDropdownOpen(false);
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelectIdea(suggestions[selectedIndex].id);
    } else if (internalQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(internalQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isDropdownOpen && suggestions.length > 0) {
        setIsDropdownOpen(true);
        return;
      }
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
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

      {/* Global Search Box Wrapper */}
      <div className="top-search-wrapper" ref={searchWrapperRef}>
        <div className="top-search-box">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search ideas, categories, or keywords..."
            value={internalQuery}
            onChange={handleInputChange}
            onFocus={() => {
              if (internalQuery.trim().length > 0) {
                setIsDropdownOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls="search-suggestions-list"
          />

          <span className="shortcut-badge">⌘K</span>

          {/* Search Icon placed to the RIGHT of the search bar */}
          <button
            type="button"
            className="search-glass-btn"
            onClick={handleSearchSubmit}
            title="Search"
            aria-label="Search"
          >
            🔍
          </button>
        </div>

        {/* Live Idea Suggestions Dropdown */}
        {isDropdownOpen && internalQuery.trim().length > 0 && (
          <div className="search-suggestions-dropdown" id="search-suggestions-list">
            <div className="suggestions-header">
              <span>{isLoading ? "Searching ideas..." : `Suggested Ideas (${suggestions.length})`}</span>
              <span className="suggestions-shortcut-hint">↑↓ to navigate • ↵ to select</span>
            </div>

            <div className="suggestions-list">
              {isLoading && suggestions.length === 0 ? (
                <div className="suggestions-loading">
                  <span>Searching ideas database...</span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="suggestions-empty">
                  <span>No ideas found matching &ldquo;{internalQuery}&rdquo;</span>
                </div>
              ) : (
                suggestions.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`suggestion-item ${selectedIndex === idx ? "selected" : ""}`}
                    onClick={() => handleSelectIdea(item.id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="suggestion-icon-badge">{item.icon}</div>
                    <div className="suggestion-info">
                      <div className="suggestion-title-row">
                        <span className="suggestion-code">{item.code}</span>
                        <span className="suggestion-title">{item.title}</span>
                      </div>
                      <div className="suggestion-meta-row">
                        <span className="suggestion-author">by {item.author}</span>
                        <span>•</span>
                        <span className="suggestion-category">{item.category}</span>
                        <span>•</span>
                        <span className="suggestion-status">{item.statusIcon} {item.statusText}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {suggestions.length > 0 && (
              <div
                className="suggestions-footer"
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push(`/?search=${encodeURIComponent(internalQuery.trim())}`);
                }}
              >
                <span>View all matching results on ideas board &rarr;</span>
              </div>
            )}
          </div>
        )}
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
