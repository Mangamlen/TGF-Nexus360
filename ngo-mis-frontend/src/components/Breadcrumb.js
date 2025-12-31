import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

const BreadcrumbItem = ({ children, isLast }) => (
  <li className={cn("flex items-center text-sm", isLast ? "text-foreground" : "text-muted-foreground")}>
    {children}
    {!isLast && <ChevronRight className="h-4 w-4 mx-2" />}
  </li>
);

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="flex items-center text-sm font-medium text-muted-foreground" aria-label="breadcrumb">
      <ol className="flex p-0 m-0 list-none">
        <BreadcrumbItem>
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        </BreadcrumbItem>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;

          let displayName = value.replace(/-/g, ' '); // Replace hyphens with spaces
          if (!isNaN(parseInt(displayName))) { // If it's an ID, just display "Details" or similar
            displayName = "Details";
          } else {
             displayName = displayName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); // Capitalize each word
          }

          return (
            <BreadcrumbItem key={to} isLast={last}>
              {last ? (
                displayName
              ) : (
                <Link to={to} className="hover:text-primary transition-colors">
                  {displayName}
                </Link>
              )}
            </BreadcrumbItem>
          );
        })}
      </ol>
    </nav>
  );
}
