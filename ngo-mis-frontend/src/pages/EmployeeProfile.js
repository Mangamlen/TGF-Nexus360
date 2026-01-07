
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import * as employeeService from "../services/employeeService";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "react-toastify";
import { intervalToDuration, formatDuration } from "date-fns";
import { User, Mail, Phone, Briefcase, Building, Calendar, ShieldCheck, Upload, Clock } from "lucide-react";
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

function ProfileCompleteness({ employee }) {
  const calculateCompleteness = () => {
    let score = 0;
    const totalPoints = 3; // phone, address, photo

    if (employee.phone) score++;
    if (employee.address) score++;
    if (employee.photo_path) score++;

    return (score / totalPoints) * 100;
  };

  const percentage = calculateCompleteness();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completeness</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-full bg-muted rounded-full h-2.5 dark:bg-muted-foreground">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <span className="text-lg font-semibold">{Math.round(percentage)}%</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {percentage < 100 
            ? "Complete your profile by adding missing information."
            : "Profile is complete!"
          }
        </p>
      </CardContent>
    </Card>
  );
}

export default function EmployeeProfile() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("photo", selectedFile);

    try {
      await employeeService.uploadEmployeePhoto(id, formData);
      toast.success("Photo uploaded successfully!");
      fetchEmployee(); // Refresh employee data
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      // Error is handled in service, but we can toast here too
      toast.error("Photo upload failed.");
    } finally {
      setIsUploading(false);
    }
  };
  
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
  };

  const calculateServiceDuration = (joiningDate) => {
    if (!joiningDate) return "N/A";
    const duration = intervalToDuration({ start: new Date(joiningDate), end: new Date() });
    return formatDuration(duration, { format: ['years', 'months'] });
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
            <Skeleton className="h-7 w-48" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-5 w-12" />
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
           <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage src={avatarUrl} alt={employee.name} />
              <AvatarFallback className="text-4xl">{getInitials(employee.name)}</AvatarFallback>
            </Avatar>
            <Button 
              size="icon" 
              className="absolute bottom-0 right-0 rounded-full"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-semibold">{employee.name || 'User Name Not Available'}</h1>
            <p className="text-xl text-muted-foreground">{employee.designation}</p>
            <p className="text-sm text-muted-foreground">{employee.department}</p>
            {employee.role && <Badge className="mt-2">{employee.role}</Badge>}
          </div>
        </CardContent>
      </Card>
      
      <ProfileCompleteness employee={employee} />

      <Card>
        <CardHeader>
          <CardTitle>Contact & Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProfileDetail icon={<Mail className="h-6 w-6 text-primary"/>} label="Email" value={employee.email} />
            <ProfileDetail icon={<Phone className="h-6 w-6 text-primary"/>} label="Phone" value={employee.phone} />
            <ProfileDetail icon={<User className="h-6 w-6 text-primary"/>} label="Employee Code" value={employee.emp_code} />
            <ProfileDetail icon={<Calendar className="h-6 w-6 text-primary"/>} label="Joining Date" value={new Date(employee.joining_date).toLocaleDateString()} />
            <ProfileDetail icon={<Clock className="h-6 w-6 text-primary"/>} label="Service Duration" value={calculateServiceDuration(employee.joining_date)} />
            <ProfileDetail icon={<Building className="h-6 w-6 text-primary"/>} label="Department" value={employee.department} />
            <ProfileDetail icon={<Briefcase className="h-6 w-6 text-primary"/>} label="Designation" value={employee.designation} />
            <ProfileDetail icon={<ShieldCheck className="h-6 w-6 text-primary"/>} label="Role" value={employee.role} />
        </CardContent>
      </Card>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {selectedFile && <p className="text-sm text-muted-foreground mt-2">Selected: {selectedFile.name}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
            <Button onClick={handlePhotoUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
