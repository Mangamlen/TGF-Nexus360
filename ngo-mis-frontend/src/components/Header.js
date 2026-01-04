import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CircleUser, Search, Bell } from "lucide-react";
import * as notificationBellService from "../services/notificationBellService";
import { cn } from "../lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { clearAuth } from "../utils/auth";

export default function Header() {
  const navigate = useNavigate(); // Add this
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/'; // Redirect to login
  };

  const fetchNotificationsData = async () => {
    try {
      const fetchedNotifications = await notificationBellService.getNotifications();
      setNotifications(fetchedNotifications);
      const count = await notificationBellService.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch notification data:", error);
    }
  };

  useEffect(() => {
    fetchNotificationsData(); // Initial fetch

    const intervalId = setInterval(fetchNotificationsData, 60000); // Poll every 60 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationBellService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, is_read: true } : notif));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationBellService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false); // Close dropdown
    navigate('/settings'); // Navigate to settings page
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      {/* This is a placeholder for the mobile sidebar toggle, which we can implement later */}
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-white">
                {unreadCount}
              </span>
            )}
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[300px] max-h-[400px] overflow-y-auto">
          <DropdownMenuLabel className="font-semibold text-lg">Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <DropdownMenuItem className="text-muted-foreground italic">No new notifications.</DropdownMenuItem>
          ) : (
            notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                className={cn("flex flex-col items-start px-4 py-2 text-sm", !notification.is_read && "bg-accent/10 font-medium")}
              >
                <div className="text-sm">{notification.message}</div>
                <div className="text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</div>
                {notification.link && (
                  <Link to={notification.link} className="text-xs text-primary hover:underline mt-1">View Details</Link>
                )}
              </DropdownMenuItem>
            ))
          )}
          {notifications.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleMarkAllAsRead} className="text-center justify-center">
                Mark all as read
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSettingsClick} className="text-center justify-center text-primary">
            Notification Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link to="/my-profile">Profile</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
