import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import * as employeeService from "../services/employeeService";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { User, Mail, Phone, Briefcase, Building, Calendar } from "lucide-react";
import API from "../services/api";
import { Skeleton } from "../components/ui/skeleton"; // Import Skeleton

function ProfileDetail({ icon, label, value }) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0">{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value || "N/A"}</p>
      </div>
    </div>
  );
}

const ProfileDetailSkeleton = () => (
  <div className="flex items-start">
    <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
    <div className="ml-4 space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-36" />
    </div>
  </div>
);

export default function EmployeeProfile() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployee = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await employeeService.getEmployeeById(id);
      setEmployee(data);
    } catch (error) {
      // Error is already handled by the service
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);
  
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
  };
  
  const avatarUrl = employee?.photo_path ? `${API.defaults.baseURL}/${employee.photo_path.replace(/\\/g, '/')}` : null;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="text-center md:text-left space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-60" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProfileDetailSkeleton />
              <ProfileDetailSkeleton />
              <ProfileDetailSkeleton />
              <ProfileDetailSkeleton />
              <ProfileDetailSkeleton />
              <ProfileDetailSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Employee not found.</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
           <Avatar className="h-32 w-32">
            <AvatarImage src={avatarUrl} alt={employee.name} />
            <AvatarFallback className="text-4xl">{getInitials(employee.name)}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{employee.name || 'User Name Not Available'}</h1>
            <p className="text-xl text-muted-foreground">{employee.designation}</p>
            <p className="text-sm text-muted-foreground">{employee.department}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact & Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProfileDetail icon={<Mail className="h-6 w-6 text-primary"/>} label="Email" value={employee.email} />
            <ProfileDetail icon={<Phone className="h-6 w-6 text-primary"/>} label="Phone" value={employee.phone} />
            <ProfileDetail icon={<User className="h-6 w-6 text-primary"/>} label="Employee Code" value={employee.emp_code} />
            <ProfileDetail icon={<Calendar className="h-6 w-6 text-primary"/>} label="Joining Date" value={new Date(employee.joining_date).toLocaleDateString()} />
            <ProfileDetail icon={<Building className="h-6 w-6 text-primary"/>} label="Department" value={employee.department} />
            <ProfileDetail icon={<Briefcase className="h-6 w-6 text-primary"/>} label="Designation" value={employee.designation} />
        </CardContent>
      </Card>
    </div>
  );
}
