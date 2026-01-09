// src/pages/StaffRegistration/JobDetailsStep.js
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";

export default function JobDetailsStep({ formData, handleChange, handleSelectChange, departments, designations, isDropdownsLoading }) {
  const employmentTypes = ["Permanent", "Contract", "Intern"];
  const statuses = ["Active", "Onboarding", "Inactive"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Job & Position</h3>
        <div className="space-y-2">
          <Label htmlFor="emp_code">Employee Code (auto-generated if blank)</Label>
          <Input id="emp_code" name="emp_code" value={formData.emp_code} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department_id">Department</Label>
          {isDropdownsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={formData.department_id} onValueChange={(value) => handleSelectChange("department_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dep => (
                  <SelectItem key={dep.id} value={dep.id.toString()}>{dep.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="designation_id">Designation</Label>
          {isDropdownsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={formData.designation_id} onValueChange={(value) => handleSelectChange("designation_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a designation" />
              </SelectTrigger>
              <SelectContent>
                {designations.map(desig => (
                  <SelectItem key={desig.id} value={desig.id.toString()}>{desig.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="space-y-2">
            <Label htmlFor="employment_type">Employment Type</Label>
            <Select value={formData.employment_type} onValueChange={(value) => handleSelectChange("employment_type", value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                    {employmentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Onboarding & Logistics</h3>
        <div className="space-y-2">
            <Label htmlFor="joining_date">Date of Joining</Label>
            <Input id="joining_date" name="joining_date" type="date" value={formData.joining_date} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <Input id="salary" name="salary" type="number" value={formData.salary} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="reporting_manager">Reporting Manager (User ID)</Label>
            <Input id="reporting_manager" name="reporting_manager" type="number" value={formData.reporting_manager} onChange={handleChange} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="work_location">Work Location</Label>
            <Input id="work_location" name="work_location" value={formData.work_location} onChange={handleChange} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    {statuses.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
      </div>
    </div>
  );
}
