// src/pages/StaffRegistration.js
import { useState, useEffect, useCallback } from "react";
import * as employeeService from "../services/employeeService";
import { toast } from "react-toastify";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Loader2 } from "lucide-react";
import { Stepper } from "../components/ui/stepper"; // Import Stepper

import PersonalInformationStep from "./StaffRegistration/PersonalInformationStep";
import ContactInformationStep from "./StaffRegistration/ContactInformationStep";
import JobDetailsStep from "./StaffRegistration/JobDetailsStep";
import BankAccountStep from "./StaffRegistration/BankAccountStep";

const steps = ["Personal", "Contact", "Job", "Bank"];

export default function StaffRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isDropdownsLoading, setIsDropdownsLoading] = useState(true);

  const [formData, setFormData] = useState({
    // Step 1
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    role_id: "3", // Default to Employee
    date_of_birth: "",
    gender: "Male",
    photo: null,
    // Step 2
    mobile_number: "",
    alternate_number: "",
    official_email: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    pin_code: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    // Step 3
    emp_code: "",
    department_id: "",
    designation_id: "",
    employment_type: "Permanent",
    joining_date: "",
    salary: "",
    reporting_manager: "",
    work_location: "",
    status: "Onboarding",
    // Step 4
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    branch_name: "",
    upi_id: "",
    pan_number: "",
    aadhaar_number: "",
  });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const roles = [
    { id: 1, name: "Super Admin" }, { id: 2, name: "Admin" },
    { id: 3, name: "Employee" }, { id: 5, name: "Field User" },
  ];

  const fetchDropdownData = useCallback(async () => {
    setIsDropdownsLoading(true);
    try {
      const [deps, desigs] = await Promise.all([
        employeeService.getDepartments(),
        employeeService.getDesignations(),
      ]);
      setDepartments(deps);
      setDesignations(desigs);
      setFormData(prev => ({
        ...prev,
        department_id: deps.length > 0 ? deps[0].id.toString() : "",
        designation_id: desigs.length > 0 ? desigs[0].id.toString() : "",
      }));
    } catch (error) {
      toast.error("Failed to load dropdown data.");
    } finally {
      setIsDropdownsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, photo: file }));
    if (file) setPhotoPreview(URL.createObjectURL(file));
    else setPhotoPreview(null);
  };
  
  const nextStep = () => setCurrentStep(prev => (prev < steps.length ? prev + 1 : prev));
  const prevStep = () => setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      return toast.error("Passwords do not match.");
    }
    setIsSubmitting(true);

    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    }

    try {
      await employeeService.registerStaff(data);
      toast.success("Staff registered successfully!");
      // Reset form
      setCurrentStep(1);
      setFormData({
        name: "", email: "", password: "", confirm_password: "", role_id: "3", date_of_birth: "", gender: "Male", photo: null,
        mobile_number: "", alternate_number: "", official_email: "", address_line_1: "", address_line_2: "", city: "", state: "", pin_code: "", emergency_contact_name: "", emergency_contact_number: "",
        emp_code: "", department_id: departments[0]?.id.toString() || "", designation_id: designations[0]?.id.toString() || "", employment_type: "Permanent", joining_date: "", salary: "", reporting_manager: "", work_location: "", status: "Onboarding",
        account_holder_name: "", bank_name: "", account_number: "", ifsc_code: "", branch_name: "", upi_id: "", pan_number: "", aadhaar_number: "",
      });
      setPhotoPreview(null);
    } catch (error) {
      // Error is handled in the service
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Registration</CardTitle>
        <CardDescription>Follow the steps to register a new employee.</CardDescription>
      </CardHeader>
      <CardContent>
        <Stepper currentStep={currentStep} steps={steps} />
        <form onSubmit={handleSubmit} className="mt-8">
          {currentStep === 1 && <PersonalInformationStep formData={formData} handleChange={handleChange} handleSelectChange={handleSelectChange} handleFileChange={handleFileChange} photoPreview={photoPreview} roles={roles} isDropdownsLoading={isDropdownsLoading} />}
          {currentStep === 2 && <ContactInformationStep formData={formData} handleChange={handleChange} />}
          {currentStep === 3 && <JobDetailsStep formData={formData} handleChange={handleChange} handleSelectChange={handleSelectChange} departments={departments} designations={designations} isDropdownsLoading={isDropdownsLoading} />}
          {currentStep === 4 && <BankAccountStep formData={formData} handleChange={handleChange} />}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && <Button type="button" variant="outline" onClick={prevStep}>Previous</Button>}
            <div />
            {currentStep < steps.length && <Button type="button" variant="secondary" onClick={nextStep}>Next</Button>}
            {currentStep === steps.length && (
              <Button type="submit" variant="secondary" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Registration
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}