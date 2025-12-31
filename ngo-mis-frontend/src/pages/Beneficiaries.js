import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"; // Import Link
import * as beneficiaryService from "../services/beneficiaryService";
import { toast } from "react-toastify";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2, PlusCircle, Trash2, Edit } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton"; // Import Skeleton

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
                   <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="w-full h-10 border rounded-md px-2" required>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
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
                  <select id="training_status" name="training_status" value={formData.training_status} onChange={handleInputChange} className="w-full h-10 border rounded-md px-2" required>
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
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
            <TableSkeleton />
          ) : beneficiaries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Training Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beneficiaries.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">
                      <Link to={`/beneficiary/${b.id}`} className="hover:underline">
                        {b.name}
                      </Link>
                    </TableCell>
                    <TableCell>{b.village}</TableCell>
                    <TableCell>{b.phone}</TableCell>
                    <TableCell>{b.training_status}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(b.id, b.training_status)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              }
              </TableBody>
            </Table>
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
