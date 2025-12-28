import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MainLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <main style={{ marginLeft: "220px", width: "calc(100% - 260px)", padding: "20px", overflowY: "auto" }}>
        <Outlet />
      </main>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
