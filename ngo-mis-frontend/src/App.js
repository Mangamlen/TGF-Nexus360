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
import PrivateRoute from "./components/PrivateRoute";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Login />} />

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
              <PrivateRoute allowedRoles={[1, 2]}>
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

          {/* All logged-in users */}
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<Leave />} />

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
