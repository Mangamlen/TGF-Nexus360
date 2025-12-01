import { useState } from "react";
import api from "../services/api";
export default function EmployeeForm(){
  const [form,setForm]=useState({});
  const [photo,setPhoto]=useState(null);
  const [doc,setDoc]=useState(null);
  const submit = async ()=> {
    const fd = new FormData();
    Object.keys(form).forEach(k=>fd.append(k, form[k]));
    if(photo) fd.append("photo", photo);
    if(doc) fd.append("doc", doc);
    await api.post("/employees/create", fd);
    alert("Employee created");
  };
  return (
    <div className="p-6 max-w-xl">
      <h2 className="text-lg font-bold">Add Employee</h2>
      <input className="input mt-2" placeholder="Employee Code" onChange={e=>setForm({...form, empCode:e.target.value})} />
      <input className="input mt-2" placeholder="First Name" onChange={e=>setForm({...form, firstName:e.target.value})} />
      <input className="input mt-2" placeholder="Last Name" onChange={e=>setForm({...form, lastName:e.target.value})} />
      <input className="input mt-2" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})} />
      <input className="input mt-2" placeholder="Phone" onChange={e=>setForm({...form, phone:e.target.value})} />
      <input type="file" className="mt-2" onChange={e=>setPhoto(e.target.files[0])} />
      <input type="file" className="mt-2" onChange={e=>setDoc(e.target.files[0])} />
      <button className="btn-primary mt-4" onClick={submit}>Save</button>
    </div>
  );
}
