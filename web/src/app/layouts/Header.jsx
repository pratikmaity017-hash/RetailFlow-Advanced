import { Menu, Search, Bell, Sun, Moon, ChevronDown } from "lucide-react";

import { useTheme } from "../../app/ThemeContext";

export default function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-button menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div className="breadcrumb">
          <span>RetailFlow</span>
          <span className="breadcrumb-separator">/</span>
          <strong>Advanced</strong>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="search-button">
          <Search size={17} />
          <span>Search anything...</span>
          <kbd>⌘ K</kbd>
        </button>

        <button
          className="icon-button theme-button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
        </button>

        <button
          className="icon-button notification-button"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="header-divider" />

        <button className="organization-button">
          <div className="organization-avatar">R</div>

          <div className="organization-details">
            <strong>RetailFlow Demo</strong>
            <span>Organization</span>
          </div>

          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}
