import {
  LayoutDashboard,
  ChartNoAxesCombined,
  Warehouse,
  ArrowLeftRight,
  RotateCcw,
  Wallet,
  RefreshCw,
  Boxes,
  Award,
  Truck,
  ClipboardList,
} from "lucide-react";

export const navigationItems = [
  {
    label: "Overview",
    path: "/advanced",
    icon: LayoutDashboard,
  },
  {
    label: "Analytics",
    path: "/advanced/analysis",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Warehouse Management",
    path: "/advanced/warehouses",
    icon: Warehouse,
  },
  {
    label: "Stock Transfers",
    path: "/advanced/transfers",
    icon: ArrowLeftRight,
  },
  {
    label: "Returns",
    path: "/advanced/returns",
    icon: RotateCcw,
  },
  {
    label: "Refunds",
    path: "/advanced/refunds",
    icon: Wallet,
  },
  {
    label: "Product Exchanges",
    path: "/advanced/exchanges",
    icon: RefreshCw,
  },
  {
    label: "Inventory Intelligence",
    path: "/advanced/inventory",
    icon: Boxes,
  },
  {
    label: "Loyalty & Store Credit",
    path: "/advanced/loyalty",
    icon: Award,
  },
  {
    label: "Supplier Intelligence",
    path: "/advanced/suppliers",
    icon: Truck,
  },
  {
    label: "Advanced Audit",
    path: "/advanced/audit",
    icon: ClipboardList,
  },
];
