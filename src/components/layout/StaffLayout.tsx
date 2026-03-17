import type { ReactNode } from "react";
import RoleLayout from "./RoleLayout";
import { LayoutDashboard, Clock } from "lucide-react";
import { ROUTES } from "../../utils/routes";

const StaffLayout = ({ children }: { children: ReactNode }) => {
  const navItems = [
    { label: "Dashboard", path: ROUTES.STAFF.DASHBOARD, icon: LayoutDashboard },
    { label: "Attendance", path: ROUTES.STAFF.ATTENDANCE, icon: Clock },
  ];

  return (
    <RoleLayout roleTitle="Staff Member" navItems={navItems}>
      {children}
    </RoleLayout>
  );
};

export default StaffLayout;
