// src/pages/Settings/RoleManager.js
import { useState, useEffect } from "react";
import * as userService from "../../services/userService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Loader2 } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import { Card } from "../../components/ui/card";

export default function RoleManager() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const roles = [
    { id: 1, name: "Super Admin" },
    { id: 2, name: "Admin" },
    { id: 3, name: "Employee" },
    { id: 5, name: "Field User" },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (error) {
        // Handled in service
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = (userId, newRoleId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role_id: newRoleId } : user
    ));
  };

  const handleUpdateRole = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUpdatingUserId(userId);
    try {
      await userService.updateUserRole(userId, user.role_id);
    } catch (error) {
      // Revert optimistic update on error, though the service will show a toast
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="flex items-center justify-between p-4">
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-9 w-[100px]" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id} className="flex items-center justify-between p-4">
          <div className="flex flex-col">
            <span className="font-semibold">{user.name}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
          <div className="flex items-center gap-4">
            <Select 
              value={user.role_id.toString()}
              onValueChange={(value) => handleRoleChange(user.id, parseInt(value, 10))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={() => handleUpdateRole(user.id)}
              disabled={updatingUserId === user.id}
              className="w-[100px]"
            >
              {updatingUserId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
