import API from "./api";

const BASE_URL = "/expenses"; // Corresponds to /api/expenses

const expenseService = {
  // Get all expenses (for admin/manager roles)
  getAllExpenses: () => API.get(`${BASE_URL}/all`),

  // Get expenses for the logged-in user
  getMyExpenses: () => API.get(`${BASE_URL}/my`),

  // Get a single expense by ID
  getExpenseById: (id) => API.get(`${BASE_URL}/${id}`),

  // Submit a new expense
  submitExpense: (expenseData) => API.post(`${BASE_URL}/submit`, expenseData),

  // Update an existing expense
  updateExpense: (id, expenseData) => API.put(`${BASE_URL}/${id}`, expenseData),

  // Delete an expense
  deleteExpense: (id) => API.delete(`${BASE_URL}/${id}`),

  // Approve an expense
  approveExpense: (id) => API.post(`${BASE_URL}/approve/${id}`),

  // Reject an expense
  rejectExpense: (id) => API.post(`${BASE_URL}/reject/${id}`),
};

export default expenseService;
