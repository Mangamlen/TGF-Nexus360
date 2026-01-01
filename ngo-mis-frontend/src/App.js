import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import ActivityLog from "./pages/ActivityLog";
import Payroll from "./pages/Payroll";
import StaffRegistration from "./pages/StaffRegistration";
import MyProfile from "./pages/MyProfile";
import Expenses from "./pages/Expenses"; // Added import
import Beneficiaries from "./pages/Beneficiaries"; // Import Beneficiaries
import BeneficiaryProfile from "./pages/BeneficiaryProfile"; // Import BeneficiaryProfile
import EmployeeDirectory from "./pages/EmployeeDirectory"; // Import EmployeeDirectory
import EmployeeProfile from "./pages/EmployeeProfile"; // Import EmployeeProfile
import Payslip from "./pages/Payslip";
import ForgotPassword from "./pages/ForgotPassword"; // Import ForgotPassword
import PrivateRoute from "./components/PrivateRoute";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Layout */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          {/* Dashboard – Admin & Manager */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/payroll"
            element={
              <PrivateRoute allowedRoles={[1, 2, 5]}>
                <Payroll />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff-registration"
            element={
              <PrivateRoute allowedRoles={[1, 2, 5]}>
                <StaffRegistration />
              </PrivateRoute>
            }
          />

          <Route
            path="/beneficiaries"
            element={
              <PrivateRoute allowedRoles={[1, 2, 5]}>
                <Beneficiaries />
              </PrivateRoute>
            }
          />
          <Route path="/beneficiary/:id" element={<BeneficiaryProfile />} />
          
          <Route path="/employees" element={<EmployeeDirectory />} />
          <Route path="/employee/:id" element={<EmployeeProfile />} />

          {/* All logged-in users */}
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/payslip" element={<Payslip />} />
          <Route
            path="/expenses"
            element={
              <PrivateRoute allowedRoles={[1, 2, 5]}>
                <Expenses />
              </PrivateRoute>
            }
          />

          {/* Super Admin only */}
          <Route
            path="/activity"
            element={
              <PrivateRoute allowedRoles={[1]}>
                <ActivityLog />
              </PrivateRoute>
            }
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
