import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "react-toastify";
import * as employeeService from "../services/employeeService";
import * as authService from "../services/authService";
import * as notificationService from "../services/notificationService"; // New import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useTheme } from "../components/ThemeProvider";

export default function Settings() {
  // State for Update Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // State for Change Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // State for Notification Preferences
  const [notificationSettings, setNotificationSettings] = useState({
    leave_request_status: true,
    payroll_updates: true,
    new_report_assignment: true,
  });
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);

  // Theme hook
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await employeeService.getProfile();
        setName(profile.user_name);
        setEmail(profile.email);
      } catch (error) {
        // Handled in service
      }
    };

    const fetchNotifications = async () => {
      try {
        const preferences = await notificationService.getNotificationPreferences();
        setNotificationSettings(prev => ({
          ...prev,
          ...preferences // Merge fetched preferences
        }));
      } catch (error) {
        // Handled in service
      }
    };
    
    fetchProfile();
    fetchNotifications();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsProfileLoading(true);
    try {
      await employeeService.updateProfileDetails({ name, email });
      toast.success("Profile updated successfully!");
    } catch (error) {
      // Handled in service
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setIsPasswordLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      // Handled in service
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleNotificationChange = async (type) => {
    setIsNotificationLoading(true);
    const newSettings = { ...notificationSettings, [type]: !notificationSettings[type] };
    setNotificationSettings(newSettings); // Optimistic update
    try {
      await notificationService.updateNotificationPreferences({ [type]: newSettings[type] });
      toast.success("Notification preference updated.");
    } catch (error) {
      toast.error("Failed to update notification preference.");
      setNotificationSettings(prev => ({ ...prev, [type]: !prev[type] })); // Revert on error
    } finally {
      setIsNotificationLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Account Settings</h2>

      {/* Update Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
          <p className="text-sm text-muted-foreground">Update your name and email address.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isProfileLoading}>
              {isProfileLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isPasswordLoading}>
              {isPasswordLoading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Interface Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Interface Preferences</CardTitle>
          <p className="text-sm text-muted-foreground">Customize your application's appearance.</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <p className="text-sm text-muted-foreground">Manage how you receive notifications.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="leave_request_status"
              checked={notificationSettings.leave_request_status}
              onChange={() => handleNotificationChange("leave_request_status")}
              disabled={isNotificationLoading}
            />
            <Label htmlFor="leave_request_status">
              Receive updates on leave request status
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="payroll_updates"
              checked={notificationSettings.payroll_updates}
              onChange={() => handleNotificationChange("payroll_updates")}
              disabled={isNotificationLoading}
            />
            <Label htmlFor="payroll_updates">
              Receive notifications for payroll updates
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="new_report_assignment"
              checked={notificationSettings.new_report_assignment}
              onChange={() => handleNotificationChange("new_report_assignment")}
              disabled={isNotificationLoading}
            />
            <Label htmlFor="new_report_assignment">
              Receive alerts for new report assignments
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <p className="text-sm text-muted-foreground">Enhance your account's security.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-md font-semibold">Two-Factor Authentication (2FA)</h3>
            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
            <Button variant="outline" disabled>Enable 2FA (Coming Soon)</Button>
          </div>
          <div className="space-y-2">
            <h3 className="text-md font-semibold">Active Sessions</h3>
            <p className="text-sm text-muted-foreground">See where you're currently logged in.</p>
            <Button variant="outline" disabled>View Active Sessions (Coming Soon)</Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
          <p className="text-sm text-muted-foreground">Manage your account and data.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-md font-semibold">Export My Data</h3>
            <p className="text-sm text-muted-foreground">Download a copy of your personal data.</p>
            <Button variant="outline" disabled>Export Data (Coming Soon)</Button>
          </div>
          <div className="space-y-2">
            <h3 className="text-md font-semibold text-destructive">Delete Account</h3>
            <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <Button variant="destructive" disabled>Delete Account (Coming Soon)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
