import { NavLink, useNavigate } from "react-router-dom";
import { getRoleId, clearAuth } from "../utils/auth";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  FileText,
  CalendarCheck,
  Plane,
  History,
  Landmark,
  LogOut,
  UserPlus, // Added
  User,     // Added
  DollarSign, // Added
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Sidebar() {
  const navigate = useNavigate();
  const roleId = getRoleId();

  const logout = () => {
    clearAuth();
    navigate("/");
  };

  const navItems = [
    (roleId === 1 || roleId === 2) && { to: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, text: "Dashboard" },
    { to: "/my-profile", icon: <User className="h-4 w-4" />, text: "My Profile" }, // Added
    (roleId === 1 || roleId === 2 || roleId === 5) && { to: "/staff-registration", icon: <UserPlus className="h-4 w-4" />, text: "Staff Registration" }, // Added
    { to: "/reports", icon: <FileText className="h-4 w-4" />, text: "Reports" },
    (roleId === 1 || roleId === 2) && { to: "/payroll", icon: <Landmark className="h-4 w-4" />, text: "Payroll" },
    { to: "/attendance", icon: <CalendarCheck className="h-4 w-4" />, text: "Attendance" },
    { to: "/leave", icon: <Plane className="h-4 w-4" />, text: "Leave" },
    (roleId === 1 || roleId === 2 || roleId === 5) && { to: "/expenses", icon: <DollarSign className="h-4 w-4" />, text: "Expenses" },
    roleId === 1 && { to: "/activity", icon: <History className="h-4 w-4" />, text: "Activity Log" },
  ].filter(Boolean); // Filter out falsy values from conditional items

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <span className="">TGF Nexus360</span>
          </NavLink>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive && "bg-muted text-primary"
                  )
                }
              >
                {item.icon}
                {item.text}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Button size="sm" className="w-full" variant="destructive" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}