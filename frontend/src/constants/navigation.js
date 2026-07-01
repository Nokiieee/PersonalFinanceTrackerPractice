import {
  LayoutDashboard,
  CreditCard,
  FolderOpen,
  Wallet,
  Target,
  BarChart3,
  User,
  Settings,
  Home,
} from "lucide-react";

// Main sidebar links (desktop + tablet icon-only rail)
export const PRIMARY_NAV = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/transactions", label: "Transactions", icon: CreditCard },
  { path: "/categories", label: "Categories", icon: FolderOpen },
  { path: "/budgets", label: "Budgets", icon: Wallet },
  { path: "/goals", label: "Savings Goals", icon: Target },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

// Bottom-of-sidebar links, shown after a divider
export const FOOTER_NAV = [
  { path: "/profile", label: "Profile", icon: User },
  { path: "/settings", label: "Settings", icon: Settings },
];

// Mobile bottom navigation bar (5 items, "Add" is handled separately)
export const MOBILE_NAV = [
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/transactions", label: "Transactions", icon: CreditCard },
  { id: "add", label: "Add", icon: null },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/profile", label: "Profile", icon: User },
];

// Items shown on the mobile Profile/"More" page that aren't in the bottom bar
export const MORE_ITEMS = [
  { path: "/profile", label: "My Profile", icon: User },
  { path: "/budgets", label: "Budgets", icon: Wallet },
  { path: "/goals", label: "Savings Goals", icon: Target },
  { path: "/categories", label: "Categories", icon: FolderOpen },
  { path: "/settings", label: "Settings", icon: Settings },
];

// Maps a route path to the title shown in the top bar
export const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/categories": "Categories",
  "/budgets": "Budgets",
  "/goals": "Savings Goals",
  "/reports": "Reports",
  "/profile": "Profile",
  "/settings": "Settings",
};
