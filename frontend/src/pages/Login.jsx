import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login(){
  const [email,setEmail]=useState(''); 
  const [password,setPassword]=useState('');
  const nav = useNavigate();
  const submit = async () => {
    const res = await api.post("/auth/login",{ email, password });
    localStorage.setItem("token", res.data.accessToken);
    nav("/dashboard");
  };
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-96 bg-white shadow-md p-6 rounded">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <input className="input mb-2" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
        <input className="input mb-2" placeholder="Password" type="password" onChange={(e)=>setPassword(e.target.value)} />
        <button className="btn-primary w-full" onClick={submit}>Login</button>
      </div>
    </div>
  );
}
