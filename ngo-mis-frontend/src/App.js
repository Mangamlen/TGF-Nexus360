import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Attendance from "./pages/Attendance";
import ActivityLog from "./pages/ActivityLog";
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
          {/* Admin + Manager */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* All logged-in users */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/attendance" element={<Attendance />} />

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
