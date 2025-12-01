import { useState } from "react";
import api from "../services/api";
export default function AddBeneficiary(){
  const [form,setForm]=useState({});
  const [photo,setPhoto]=useState(null);
  const [idProof,setIdProof]=useState(null);
  const submit = async (e)=> {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(form).forEach(k=>fd.append(k, form[k]));
    if(photo) fd.append("photo", photo);
    if(idProof) fd.append("id_proof", idProof);
    await api.post("/beneficiaries", fd);
    alert("Beneficiary added");
  };
  return (
    <div className="p-6 max-w-xl">
      <h2 className="text-lg font-bold">Add Beneficiary</h2>
      <input className="input mt-2" placeholder="Full name" onChange={e=>setForm({...form, full_name:e.target.value})} />
      <input className="input mt-2" placeholder="Village" onChange={e=>setForm({...form, village:e.target.value})} />
      <input className="input mt-2" placeholder="District" onChange={e=>setForm({...form, district:e.target.value})} />
      <input className="input mt-2" placeholder="Phone" onChange={e=>setForm({...form, phone:e.target.value})} />
      <input type="file" className="mt-2" onChange={e=>setPhoto(e.target.files[0])} />
      <input type="file" className="mt-2" onChange={e=>setIdProof(e.target.files[0])} />
      <button className="btn-primary mt-4" onClick={submit}>Save</button>
    </div>
  );
}
