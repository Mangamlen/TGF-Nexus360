import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EmployeeForm from "./pages/EmployeeForm";
import AddBeneficiary from "./pages/AddBeneficiary";
import "./index.css";

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/employee/add' element={<EmployeeForm/>} />
        <Route path='/beneficiary/add' element={<AddBeneficiary/>} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App/>);
