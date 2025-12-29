import { useState, useEffect, useCallback } from "react";
import * as employeeService from "../services/employeeService";
import { toast } from "react-toastify";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2 } from "lucide-react";

export default function StaffRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "3", // Default to Employee role
    emp_code: "",
    department_id: "",
    designation_id: "",
    joining_date: "",
    salary: "",
    phone: "",
    address: "",
    photo: null,
  });
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Hardcoded roles for dropdown
  const roles = [
    { id: 1, name: "Super Admin" },
    { id: 2, name: "Admin" },
    { id: 3, name: "Employee" },
    { id: 5, name: "Field User" },
  ];

  const fetchDropdownData = useCallback(async () => {
    try {
      const [deps, desigs] = await Promise.all([
        employeeService.getDepartments(),
        employeeService.getDesignations(),
      ]);
      setDepartments(deps);
      setDesignations(desigs);
      // Set default values if available
      if (deps.length > 0) setFormData(prev => ({ ...prev, department_id: deps[0].id }));
      if (desigs.length > 0) setFormData(prev => ({ ...prev, designation_id: desigs[0].id }));
    } catch (error) {
      console.error("Failed to fetch dropdown data:", error);
      toast.error("Failed to load department or designation data.");
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

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
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    }

    try {
      await employeeService.registerStaff(data);
      // Reset form on success
      setFormData({
        name: "", email: "", password: "", role_id: "3", emp_code: "", department_id: departments[0]?.id || "",
        designation_id: designations[0]?.id || "", joining_date: "", salary: "", phone: "", address: "", photo: null,
      });
      setPhotoPreview(null);
    } catch (error) {
      // Error handled by service
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Staff Registration</CardTitle>
          <CardDescription>Register a new user and create their employee profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">User Account</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role_id">Role</Label>
                <select id="role_id" name="role_id" value={formData.role_id} onChange={handleChange} className="w-full h-10 border rounded-md px-2" required>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employee Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Employee Profile</h3>
              <div className="space-y-2">
                <Label htmlFor="emp_code">Employee Code</Label>
                <Input id="emp_code" name="emp_code" value={formData.emp_code} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department_id">Department</Label>
                <select id="department_id" name="department_id" value={formData.department_id} onChange={handleChange} className="w-full h-10 border rounded-md px-2" required>
                  {departments.map(dep => (
                    <option key={dep.id} value={dep.id}>{dep.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation_id">Designation</Label>
                <select id="designation_id" name="designation_id" value={formData.designation_id} onChange={handleChange} className="w-full h-10 border rounded-md px-2" required>
                  {designations.map(desig => (
                    <option key={desig.id} value={desig.id}>{desig.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="joining_date">Joining Date</Label>
                <Input id="joining_date" name="joining_date" type="date" value={formData.joining_date} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input id="salary" name="salary" type="number" value={formData.salary} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Profile Photo</Label>
                <Input id="photo" name="photo" type="file" onChange={handleFileChange} accept="image/*" />
                {photoPreview && (
                  <img src={photoPreview} alt="Profile Preview" className="mt-2 h-20 w-20 rounded-full object-cover" />
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Employee
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
