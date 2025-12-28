import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <main style={{ width: "100%", padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}
