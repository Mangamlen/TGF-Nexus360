import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"; // Import Link
import * as beneficiaryService from "../services/beneficiaryService";
import { toast } from "react-toastify";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2, PlusCircle, Trash2, Edit } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton"; // Import Skeleton
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <Table>
    <TableHeader>
      <TableRow>
        {Array.from({ length: cols }).map((_, i) => (
          <TableHead key={i}><Skeleton className="h-4 w-full" /></TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gender: "Male",
    village: "",
    phone: "",
    training_status: "Not Started",
  });

  const fetchBeneficiaries = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await beneficiaryService.getAllBeneficiaries();
      setBeneficiaries(data);
    } catch (error) {
      // Error is already handled by the service
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const resetForm = () => {
    setFormData({ name: "", gender: "Male", village: "", phone: "", training_status: "Not Started" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await beneficiaryService.addBeneficiary(formData);
      setIsDialogOpen(false); // Close dialog on success
      resetForm();
      fetchBeneficiaries(); // Refresh the list
    } catch (error) {
      // Error handled by service
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this beneficiary?")) {
      try {
        await beneficiaryService.deleteBeneficiary(id);
        toast.success("Beneficiary deleted successfully.");
        fetchBeneficiaries(); // Refresh list
      } catch (error) {
        // Error handled by service
      }
    }
  };
  
  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = window.prompt("Enter new training status (e.g., Not Started, In Progress, Completed):", currentStatus);
    if (newStatus && newStatus !== currentStatus) {
      try {
        await beneficiaryService.updateTrainingStatus(id, newStatus);
        fetchBeneficiaries(); // Refresh list
      } catch (error) {
        // Error handled by service
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-semibold mb-4">Beneficiary Management</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Beneficiaries</CardTitle>
            <CardDescription>Manage the beneficiaries in the program.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Beneficiary
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Beneficiary</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select id="gender" name="gender" value={formData.gender} onValueChange={(value) => handleInputChange({ target: { name: 'gender', value: value }})} required>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="village">Village</Label>
                  <Input id="village" name="village" value={formData.village} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="training_status">Training Status</Label>
                  <Select id="training_status" name="training_status" value={formData.training_status} onValueChange={(value) => handleInputChange({ target: { name: 'training_status', value: value }})} required>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Beneficiary
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : beneficiaries.length > 0 ? (
            <div className="space-y-4">
              {beneficiaries.map((b) => (
                <Card key={b.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <Link to={`/beneficiary/${b.id}`} className="font-semibold hover:underline">
                        {b.name}
                      </Link>
                      <span className="text-sm text-muted-foreground">{b.village} | {b.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={
                      b.training_status === 'Completed' ? 'default' : 
                      b.training_status === 'In Progress' ? 'secondary' : 'outline'
                    }>
                      {b.training_status}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(b.id, b.training_status)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24 text-muted-foreground">
              No beneficiaries found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
