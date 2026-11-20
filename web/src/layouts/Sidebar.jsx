import { NavLink } from "react-router-dom";
import { X, Store } from "lucide-react";
import { navigationItems } from "../app/navigation";
import "./Sidebar.css";

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "visible" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Store size={21} />
          </div>

          <div className="brand-text">
            <strong>RetailFlow</strong>
            <span>Advanced Retail</span>
          </div>

          <button
            className="icon-button sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/advanced"}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
                onClick={onClose}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-icon">RF</div>
          <div>
            <strong>RetailFlow SaaS</strong>
            <span>Advanced workspace</span>
          </div>
        </div>
      </aside>
    </>
  );
}
