import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { DatePicker } from "../components/ui/date-picker"; // Import DatePicker
import { Skeleton } from "../components/ui/skeleton"; // Import Skeleton
import expenseService from "../services/expenseService"; // Import the service
import projectService from "../services/projectService"; // Import project service
import { getRoleId } from "../utils/auth";
import { toast } from "react-toastify"; // Import toast for consistent error handling
import { format } from "date-fns"; // Import format for dates
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"; // Import Select components

const TableSkeleton = ({ rows = 5, cols = 8 }) => (
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

export default function Expenses() {
  const roleId = getRoleId();
  const isAdmin = roleId === 1;
  const isManager = roleId === 2;
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]); // State to store projects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null); // For editing
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    expense_date: null, // Change to Date object for DatePicker
    description: "",
    receipt_url: "",
    project_id: "", // Add project_id to form data
  });

  const fetchProjects = useCallback(async () => {
    try {
      const res = await projectService.getAllProjects();
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      toast.error("Failed to load projects.");
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await expenseService.getAllExpenses(); // Or getMyExpenses() based on role
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
      setError("Failed to load expenses.");
      toast.error("Failed to load expenses."); // Consistent toast notification
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchProjects(); // Fetch projects on component mount
  }, [fetchExpenses, fetchProjects]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, expense_date: date }));
  };

  const openAddModal = () => {
    setCurrentExpense(null);
    setFormData({
      category: "",
      amount: "",
      expense_date: null,
      description: "",
      receipt_url: "",
      project_id: "", // Initialize project_id for new expense
    });
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount,
      expense_date: expense.expense_date ? new Date(expense.expense_date) : null,
      description: expense.description,
      receipt_url: expense.receipt_url,
      project_id: expense.project_id || "", // Set existing project_id for editing
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExpense(null); // Clear current expense on close
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      expense_date: formData.expense_date ? format(formData.expense_date, "yyyy-MM-dd") : null,
      project_id: formData.project_id ? parseInt(formData.project_id) : null, // Ensure project_id is a number or null
    };

    try {
      if (currentExpense) {
        await expenseService.updateExpense(currentExpense.id, payload);
        toast.success("Expense updated successfully!");
      } else {
        await expenseService.submitExpense(payload);
        toast.success("Expense submitted successfully!");
      }
      closeModal();
      fetchExpenses(); // Refresh the list
    } catch (err) {
      console.error("Error submitting expense:", err);
      setError("Failed to save expense.");
      toast.error(err.response?.data?.error || "Failed to save expense.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await expenseService.deleteExpense(id);
        toast.success("Expense deleted successfully!");
        fetchExpenses(); // Refresh the list
      } catch (err) {
        console.error("Error deleting expense:", err);
        setError("Failed to delete expense.");
        toast.error("Failed to delete expense.");
      }
    }
  };

  const handleApproveReject = async (id, status) => {
    try {
      if (status === "Approved") {
        await expenseService.approveExpense(id);
        toast.success("Expense approved!");
      } else {
        await expenseService.rejectExpense(id);
        toast.success("Expense rejected!");
      }
      fetchExpenses(); // Refresh the list
    } catch (err) {
      console.error(`Error ${status}ing expense:`, err);
      setError(`Failed to ${status} expense.`);
      toast.error(`Failed to ${status} expense.`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-status-approved text-primary-foreground hover:bg-status-approved/90">{status}</Badge>;
      case "Pending":
        return <Badge className="bg-status-pending text-primary-foreground hover:bg-status-pending/90">{status}</Badge>;
      case "Rejected":
        return <Badge className="bg-status-rejected text-primary-foreground hover:bg-status-rejected/90">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Expense Management</h1>
        <Button onClick={openAddModal} variant="secondary">Add New Expense</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>A list of all submitted expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton cols={8} />
          ) : error ? (
            <div className="flex items-center justify-center h-24 text-destructive">
              {error}
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground">
              No expenses found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Project</TableHead> 
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.id}</TableCell>
                      <TableCell>{expense.user_name}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>₹{parseFloat(expense.amount).toLocaleString('en-IN')}</TableCell>
                      <TableCell>{format(new Date(expense.expense_date), "PPP")}</TableCell>
                      <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                      <TableCell>{expense.project_name || "N/A"}</TableCell> 
                      <TableCell>
                        {getStatusBadge(expense.status)}
                      </TableCell>
                      <TableCell className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(expense)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(expense.id)}>Delete</Button>
                        {expense.status === "Pending" && (isAdmin || isManager) && (
                          <>
                            <Button variant="secondary" size="sm" onClick={() => handleApproveReject(expense.id, "Approved")}>Approve</Button>
                            <Button variant="secondary" size="sm" onClick={() => handleApproveReject(expense.id, "Rejected")}>Reject</Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Expense Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
            <DialogDescription>
              {currentExpense ? "Edit the details of the expense." : "Fill in the details for the new expense."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expense_date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <DatePicker
                  date={formData.expense_date}
                  setDate={handleDateChange}
                  placeholder="Select expense date"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receipt_url" className="text-right">
                Receipt URL
              </Label>
              <Input
                id="receipt_url"
                name="receipt_url"
                value={formData.receipt_url}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project_id" className="text-right">
                Project
              </Label>
              <div className="col-span-3">
                <Select
                  name="project_id"
                  value={formData.project_id ? String(formData.project_id) : "null-project"} // Handle null/undefined to "null-project"
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, project_id: value === "null-project" ? null : value }))} // Convert "null-project" back to null
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null-project">No Project</SelectItem> {/* Changed value */}
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={String(project.id)}>
                        {project.project_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" variant="secondary">{currentExpense ? "Save changes" : "Add Expense"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
