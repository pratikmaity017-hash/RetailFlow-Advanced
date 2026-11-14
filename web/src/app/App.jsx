import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import DashboardPage from "../features/dashboard/DashboardPage";
import FeaturePlaceholderPage from "../features/common/FeaturePlaceholderPage";

function App() {
  return (
    <Routes>
      <Route path="/advanced" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />

        <Route path="analysis" element={<FeaturePlaceholderPage />} />
        <Route path="warehouses" element={<FeaturePlaceholderPage />} />
        <Route path="transfers" element={<FeaturePlaceholderPage />} />
        <Route path="returns" element={<FeaturePlaceholderPage />} />
        <Route path="refunds" element={<FeaturePlaceholderPage />} />
        <Route path="exchanges" element={<FeaturePlaceholderPage />} />
        <Route path="inventory" element={<FeaturePlaceholderPage />} />
        <Route path="loyalty" element={<FeaturePlaceholderPage />} />
        <Route path="suppliers" element={<FeaturePlaceholderPage />} />
        <Route path="audit" element={<FeaturePlaceholderPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/advanced" replace />} />
      <Route path="*" element={<Navigate to="/advanced" replace />} />
    </Routes>
  );
}

export default App;
