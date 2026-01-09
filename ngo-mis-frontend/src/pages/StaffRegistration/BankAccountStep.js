// src/pages/StaffRegistration/BankAccountStep.js
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function BankAccountStep({ formData, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Bank Account</h3>
        <div className="space-y-2">
          <Label htmlFor="account_holder_name">Account Holder Name</Label>
          <Input id="account_holder_name" name="account_holder_name" value={formData.account_holder_name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank_name">Bank Name</Label>
          <Input id="bank_name" name="bank_name" value={formData.bank_name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account_number">Account Number</Label>
          <Input id="account_number" name="account_number" value={formData.account_number} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ifsc_code">IFSC Code</Label>
          <Input id="ifsc_code" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="branch_name">Branch Name</Label>
            <Input id="branch_name" name="branch_name" value={formData.branch_name} onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Identification</h3>
        <div className="space-y-2">
          <Label htmlFor="upi_id">UPI ID (Optional)</Label>
          <Input id="upi_id" name="upi_id" value={formData.upi_id} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pan_number">PAN Number</Label>
          <Input id="pan_number" name="pan_number" value={formData.pan_number} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aadhaar_number">Aadhaar Number (Optional)</Label>
          <Input id="aadhaar_number" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
}
