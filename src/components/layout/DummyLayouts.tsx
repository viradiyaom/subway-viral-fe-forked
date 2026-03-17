import type { ReactNode } from "react";
import RoleLayout from "./RoleLayout";
import { LayoutDashboard } from "lucide-react";

export const RootLayout = ({ children }: { children: ReactNode }) => (
  <RoleLayout roleTitle="Super Root" navItems={[{ label: "Dashboard", path: "/root/dashboard", icon: LayoutDashboard }]}>
    {children}
  </RoleLayout>
);

export const ManagerLayout = ({ children }: { children: ReactNode }) => (
  <RoleLayout roleTitle="Manager" navItems={[{ label: "Dashboard", path: "/manager/dashboard", icon: LayoutDashboard }]}>
    {children}
  </RoleLayout>
);

export const SubManagerLayout = ({ children }: { children: ReactNode }) => (
  <RoleLayout roleTitle="Sub-Manager" navItems={[{ label: "Dashboard", path: "/sub-manager/dashboard", icon: LayoutDashboard }]}>
    {children}
  </RoleLayout>
);
