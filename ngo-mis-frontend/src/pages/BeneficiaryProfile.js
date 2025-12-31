import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import * as beneficiaryService from "../services/beneficiaryService";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, User, MapPin, Phone, Award } from "lucide-react";

export default function BeneficiaryProfile() {
  const { id } = useParams();
  const [beneficiary, setBeneficiary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBeneficiary = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await beneficiaryService.getBeneficiaryById(id);
      setBeneficiary(data);
    } catch (error) {
      // Error is already handled by the service
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBeneficiary();
  }, [fetchBeneficiary]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading beneficiary profile...</span>
      </div>
    );
  }

  if (!beneficiary) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center">
        <h2 className="text-xl font-semibold">Beneficiary not found.</h2>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-3xl">
            <User className="mr-4 h-8 w-8" />
            {beneficiary.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
            <div className="flex items-center">
              <MapPin className="mr-3 h-5 w-5 text-muted-foreground" />
              <strong>Village:</strong>
              <span className="ml-2">{beneficiary.village}</span>
            </div>
            <div className="flex items-center">
              <Phone className="mr-3 h-5 w-5 text-muted-foreground" />
              <strong>Phone:</strong>
              <span className="ml-2">{beneficiary.phone || "N/A"}</span>
            </div>
             <div className="flex items-center">
              <User className="mr-3 h-5 w-5 text-muted-foreground" />
              <strong>Gender:</strong>
              <span className="ml-2">{beneficiary.gender}</span>
            </div>
            <div className="flex items-center">
              <Award className="mr-3 h-5 w-5 text-muted-foreground" />
              <strong>Training Status:</strong>
              <span className="ml-2">{beneficiary.training_status}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for future sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Honey Production History</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">Honey production records will be displayed here.</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Associated Reports</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">Links to reports this beneficiary was a part of will be displayed here.</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
