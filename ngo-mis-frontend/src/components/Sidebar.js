import { NavLink, useNavigate } from "react-router-dom";
import { getRoleId, clearAuth } from "../utils/auth";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  FileText,
  CalendarCheck,
  History,
  Landmark,
  LogOut,
  UserPlus,
  User,
  Users,
  Contact, // For Employee Directory
  DollarSign,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"; // Added Accordion imports

export default function Sidebar() {
  const navigate = useNavigate();
  const roleId = getRoleId();

  const logout = () => {
    clearAuth();
    navigate("/");
  };

  const navItems = [
    (roleId === 1 || roleId === 2) && { to: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, text: "Dashboard" },
    { to: "/my-profile", icon: <User className="h-4 w-4" />, text: "My Profile" },
    (roleId === 1 || roleId === 2 || roleId === 5) && { to: "/staff-registration", icon: <UserPlus className="h-4 w-4" />, text: "Staff Registration" },
    (roleId === 1 || roleId === 2 || roleId === 5) && { to: "/employees", icon: <Contact className="h-4 w-4" />, text: "Employee Directory" },
    (roleId === 1 || roleId === 2 || roleId === 5) && { to: "/beneficiaries", icon: <Users className="h-4 w-4" />, text: "Beneficiaries" },
    { to: "/reports", icon: <FileText className="h-4 w-4" />, text: "Reports" },
    // Payroll with nested items for Admin, Manager, and Employee
    (roleId === 1 || roleId === 2 || roleId === 5) && {
      icon: <Landmark className="h-4 w-4" />,
      text: "Payroll",
      children: [
        { to: "/payroll", text: "Payroll Overview" }, // Admin/Manager/Employee
        (roleId === 1 || roleId === 2 || roleId === 5) && { to: "/payslip", text: "Payslip" }, // All roles
      ].filter(Boolean) // Filter out falsy values from conditional items
    },
    // Group Attendance and Leave together
    {
      icon: <CalendarCheck className="h-4 w-4" />,
      text: "Attendance",
      children: [
        { to: "/attendance", text: "Attendance" },
        { to: "/leave", text: "Leave" },
      ]
    },
    (roleId === 1 || roleId === 2 || roleId === 5) && { to: "/expenses", icon: <DollarSign className="h-4 w-4" />, text: "Expenses" },
    roleId === 1 && { to: "/activity", icon: <History className="h-4 w-4" />, text: "Activity Log" },
  ].filter(Boolean); // Filter out falsy values from conditional items

  return (
    <div className="hidden border-r bg-muted/40 md:block relative">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <span className="">TGF Nexus360</span>
          </NavLink>
        </div>
        <div className="flex-1 overflow-auto">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 pb-16">
            {navItems.map((item, index) => (
              item.children ? (
                <Accordion type="single" collapsible key={index}>
                  <AccordionItem value={`item-${index}`} className="border-b-0">
                    <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                      {item.icon}
                      {item.text}
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-0">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ml-6",
                              isActive && "bg-muted text-primary"
                            )
                          }
                        >
                          {child.text}
                        </NavLink>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
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
              )
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-4">
          <Button size="sm" className="w-full" variant="destructive" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}