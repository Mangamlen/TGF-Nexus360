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
import expenseService from "../services/expenseService"; // Import the service
import { getRoleId } from "../utils/auth";

export default function Expenses() {
  const roleId = getRoleId();
  const isAdmin = roleId === 1;
  const isManager = roleId === 2;
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null); // For editing
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    expense_date: "",
    description: "",
    receipt_url: "",
  });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      // Assuming a user can only see their own expenses, or an admin can see all
      // For simplicity, let's assume `getAllExpenses` is for admin/manager, and `getMyExpenses` for regular users.
      // We might need to check user role here in a real app.
      const res = await expenseService.getAllExpenses(); // Or getMyExpenses() based on role
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
      setError("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setCurrentExpense(null);
    setFormData({
      category: "",
      amount: "",
      expense_date: "",
      description: "",
      receipt_url: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount,
      expense_date: expense.expense_date.split('T')[0], // Format date for input type="date"
      description: expense.description,
      receipt_url: expense.receipt_url,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentExpense) {
        await expenseService.updateExpense(currentExpense.id, formData);
      } else {
        await expenseService.submitExpense(formData);
      }
      closeModal();
      fetchExpenses(); // Refresh the list
    } catch (err) {
      console.error("Error submitting expense:", err);
      setError("Failed to save expense.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await expenseService.deleteExpense(id);
        fetchExpenses(); // Refresh the list
      } catch (err) {
        console.error("Error deleting expense:", err);
        setError("Failed to delete expense.");
      }
    }
  };

  const handleApproveReject = async (id, status) => {
    try {
      if (status === "Approved") {
        await expenseService.approveExpense(id);
      } else {
        await expenseService.rejectExpense(id);
      }
      fetchExpenses(); // Refresh the list
    } catch (err) {
      console.error(`Error ${status}ing expense:`, err);
      setError(`Failed to ${status} expense.`);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "Approved":
        return "default";
      case "Pending":
        return "outline";
      case "Rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Expense Management</CardTitle>
        <CardDescription>Manage all employee expenses.</CardDescription>
        <Button onClick={openAddModal} className="mt-2">Add New Expense</Button>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-center py-4">Loading expenses...</p>}
        {error && <p className="text-center py-4 text-red-500">{error}</p>}

        {!loading && !error && (
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
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No expenses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.id}</TableCell>
                      <TableCell>{expense.user_name}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>${parseFloat(expense.amount).toFixed(2)}</TableCell>
                      <TableCell>{expense.expense_date}</TableCell>
                      <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(expense.status)}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(expense)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(expense.id)}>Delete</Button>
                        {expense.status === "Pending" && (isAdmin || isManager) && (
                          <>
                            <Button size="sm" onClick={() => handleApproveReject(expense.id, "Approved")}>Approve</Button>
                            <Button variant="secondary" size="sm" onClick={() => handleApproveReject(expense.id, "Rejected")}>Reject</Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

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
              <Input
                id="expense_date"
                name="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
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
            <DialogFooter>
              <Button type="submit">{currentExpense ? "Save changes" : "Add Expense"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
