import { useLocation } from "react-router-dom";
import { navigationItems } from "../../../app/navigation";
import "./FeaturePlaceholderPage.css";
import "../../../shared/styles/page.css";

export default function FeaturePlaceholderPage() {
  const location = useLocation();

  const currentFeature = navigationItems.find(
    (item) => item.path === location.pathname,
  );

  const title = currentFeature?.label || "Advanced Feature";

  return (
    <div className="page-layout">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADVANCED MODULE</span>
          <h1>{title}</h1>
          <p>Manage and monitor your {title.toLowerCase()} operations.</p>
        </div>
      </div>

      <section className="panel placeholder-panel">
        <div className="placeholder-content">
          <div className="placeholder-symbol">
            {currentFeature?.icon && <currentFeature.icon size={27} />}
          </div>

          <h2>{title}</h2>

          <p>
            This module is part of the RetailFlow Advanced platform. Its
            functionality will be developed in a dedicated feature phase.
          </p>

          <span className="development-label">
            Foundation ready · Development pending
          </span>
        </div>
      </section>
    </div>
  );
}
