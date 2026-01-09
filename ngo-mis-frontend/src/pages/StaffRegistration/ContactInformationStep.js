// src/pages/StaffRegistration/ContactInformationStep.js
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function ContactInformationStep({ formData, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Contact Details</h3>
        <div className="space-y-2">
          <Label htmlFor="mobile_number">Mobile Number</Label>
          <Input id="mobile_number" name="mobile_number" value={formData.mobile_number} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="alternate_number">Alternate Number</Label>
          <Input id="alternate_number" name="alternate_number" value={formData.alternate_number} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="official_email">Official Email (Optional)</Label>
          <Input id="official_email" name="official_email" type="email" value={formData.official_email} onChange={handleChange} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="address_line_1">Address Line 1</Label>
            <Input id="address_line_1" name="address_line_1" value={formData.address_line_1} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="address_line_2">Address Line 2</Label>
            <Input id="address_line_2" name="address_line_2" value={formData.address_line_2} onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Location & Emergency</h3>
        <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" value={formData.state} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="pin_code">PIN Code</Label>
            <Input id="pin_code" name="pin_code" value={formData.pin_code} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
            <Input id="emergency_contact_name" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="emergency_contact_number">Emergency Contact Number</Label>
            <Input id="emergency_contact_number" name="emergency_contact_number" value={formData.emergency_contact_number} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
}
