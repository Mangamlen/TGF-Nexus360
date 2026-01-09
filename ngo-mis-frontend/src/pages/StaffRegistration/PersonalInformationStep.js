// src/pages/StaffRegistration/PersonalInformationStep.js
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";

export default function PersonalInformationStep({ formData, handleChange, handleSelectChange, handleFileChange, photoPreview, roles, isDropdownsLoading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Personal Information</h3>
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="photo">Profile Photo</Label>
            <Input id="photo" name="photo" type="file" onChange={handleFileChange} accept="image/*" />
            {photoPreview && (
              <img src={photoPreview} alt="Profile Preview" className="mt-2 h-20 w-20 rounded-full object-cover" />
            )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">User Account</h3>
        <div className="space-y-2">
          <Label htmlFor="email">Email (Login ID)</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input id="confirm_password" name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role_id">Role</Label>
          {isDropdownsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={formData.role_id} onValueChange={(value) => handleSelectChange("role_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}
