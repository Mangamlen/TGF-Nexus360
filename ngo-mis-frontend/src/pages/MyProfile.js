import { useState, useEffect, useCallback } from "react";
import * as employeeService from "../services/employeeService";
import { toast } from "react-toastify";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2 } from "lucide-react";
import API from "../services/api"; // To get base URL for photo display
import { Skeleton } from "../components/ui/skeleton"; // Import Skeleton


export default function MyProfile() {
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    photo: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await employeeService.getProfile();
      setProfileData(data);
      setFormData({
        phone: data.phone || "",
        address: data.address || "",
        photo: null,
      });
      if (data.photo_path) {
        setPhotoPreview(`${API.defaults.baseURL}/${data.photo_path.replace(/\\/g, '/')}`);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, photo: file }));
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      // If no new file selected, revert to existing photo or null
      setPhotoPreview(profileData?.photo_path ? `${API.defaults.baseURL}/${profileData.photo_path.replace(/\\/g, '/')}` : null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    if (formData.phone !== profileData.phone) data.append("phone", formData.phone);
    if (formData.address !== profileData.address) data.append("address", formData.address);
    if (formData.photo) data.append("photo", formData.photo);
    
    // Only submit if there are actual changes
    if (Array.from(data.keys()).length === 0) {
        toast.info("No changes to submit.");
        setIsSubmitting(false);
        return;
    }

    try {
      await employeeService.updateProfile(data);
      toast.success("Profile updated successfully!");
      // Re-fetch profile to show updated data and clear new photo preview
      fetchProfile();
      setFormData(prev => ({ ...prev, photo: null })); // Clear photo from form state
    } catch (error) {
      // Error handled by service
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4"><Skeleton className="h-6 w-48" /></h3>
                <div className="space-y-2"><Label><Skeleton className="h-4 w-24" /></Label><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Label><Skeleton className="h-4 w-24" /></Label><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Label><Skeleton className="h-4 w-24" /></Label><Skeleton className="h-10 w-full" /></div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4"><Skeleton className="h-6 w-48" /></h3>
                <div className="space-y-2"><Label><Skeleton className="h-4 w-24" /></Label><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Label><Skeleton className="h-4 w-24" /></Label><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Label><Skeleton className="h-4 w-24" /></Label><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Label><Skeleton className="h-4 w-24" /></Label><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Label><Skeleton className="h-4 w-24" /></Label><Skeleton className="h-10 w-full" /></div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4"><Skeleton className="h-6 w-48" /></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label><Skeleton className="h-4 w-24" /></Label><Skeleton className="h-10 w-full" /></div>
                  <div className="space-y-2"><Label><Skeleton className="h-4 w-24" /></Label><Skeleton className="h-10 w-full" /></div>
                </div>
                <div className="space-y-2">
                  <Label><Skeleton className="h-4 w-24" /></Label>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-20 rounded-full mt-2" />
                </div>
              </div>
              <div className="md:col-span-2"><Skeleton className="h-10 w-40" /></div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p>Profile data could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>View and update your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Display Read-only Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Account Information</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={profileData.user_name} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profileData.email} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={profileData.role_id === 1 ? 'Super Admin' : profileData.role_id === 2 ? 'Admin' : profileData.role_id === 3 ? 'Employee' : 'Field User'} readOnly />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Employee Details</h3>
              <div className="space-y-2">
                <Label htmlFor="emp_code">Employee Code</Label>
                <Input id="emp_code" value={profileData.emp_code} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={profileData.department_name} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" value={profileData.designation_title} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joining_date">Joining Date</Label>
                <Input id="joining_date" value={profileData.joining_date ? new Date(profileData.joining_date).toLocaleDateString() : 'N/A'} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input id="salary" value={profileData.salary != null ? `₹${profileData.salary.toLocaleString('en-IN')}` : 'N/A'} readOnly />
              </div>
            </div>

            {/* Editable Fields */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Contact Information & Photo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Profile Photo</Label>
                <Input id="photo" name="photo" type="file" onChange={handleFileChange} accept="image/*" />
                {photoPreview && (
                  <img src={photoPreview} alt="Profile Preview" className="mt-2 h-20 w-20 rounded-full object-cover" />
                )}
                {!photoPreview && profileData.photo_path && (
                    <p className="text-sm text-muted-foreground">No new photo selected. Current photo will be retained.</p>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={isSubmitting} variant="secondary">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
