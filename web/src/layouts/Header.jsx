import { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Check,
  Building2,
} from "lucide-react";

import { useTheme } from "../app/ThemeContext";
import { useOrganization } from "../features/organization/organizationContext";
import "./Header.css";

export default function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();

  const { organizations, selectedOrganization, selectOrganization } =
    useOrganization();

  const [organizationMenuOpen, setOrganizationMenuOpen] = useState(false);

  function handleOrganizationSelect(organizationId) {
    selectOrganization(organizationId);
    setOrganizationMenuOpen(false);
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-button menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          type="button"
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
        <button className="search-button" type="button">
          <Search size={17} />
          <span>Search anything...</span>
          <kbd>Ctrl K</kbd>
        </button>

        <button
          className="icon-button theme-button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
          type="button"
        >
          {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
        </button>

        <button
          className="icon-button notification-button"
          aria-label="Notifications"
          type="button"
        >
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="header-divider" />

        <div className="organization-selector">
          <button
            className="organization-button"
            type="button"
            aria-haspopup="menu"
            aria-expanded={organizationMenuOpen}
            onClick={() => setOrganizationMenuOpen((current) => !current)}
          >
            <div className="organization-avatar">
              {selectedOrganization.name.charAt(0)}
            </div>

            <div className="organization-details">
              <strong>{selectedOrganization.name}</strong>
              <span>{selectedOrganization.type}</span>
            </div>

            <ChevronDown
              size={16}
              className={
                organizationMenuOpen ? "organization-chevron-open" : ""
              }
            />
          </button>

          {organizationMenuOpen && (
            <div className="organization-menu" role="menu">
              <div className="organization-menu-heading">
                <span>SWITCH ORGANIZATION</span>
                <strong>Select a workspace</strong>
              </div>

              <div className="organization-options">
                {organizations.map((organization) => {
                  const isSelected =
                    selectedOrganization.id === organization.id;

                  return (
                    <button
                      key={organization.id}
                      className={`organization-option ${
                        isSelected ? "selected" : ""
                      }`}
                      type="button"
                      role="menuitem"
                      onClick={() => handleOrganizationSelect(organization.id)}
                    >
                      <span className="organization-option-icon">
                        <Building2 size={17} />
                      </span>

                      <span className="organization-option-details">
                        <strong>{organization.name}</strong>
                        <small>{organization.type}</small>
                      </span>

                      {isSelected && (
                        <Check
                          size={17}
                          className="organization-option-check"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="organization-menu-footer">
                Demo selector · Core API integration pending
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
