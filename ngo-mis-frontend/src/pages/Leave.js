import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getRoleId } from "../utils/auth";
import { submitLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } from "../services/leaveService";

export default function Leave() {
  const roleId = getRoleId();
  const isAdmin = roleId === 1 || roleId === 2;

  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: ""
  });

  const loadLeaves = async () => {
    try {
      const data = isAdmin ? await getAllLeaves() : await getMyLeaves();
      setLeaves(data);
    } catch (err) {
      toast.error("Failed to load leave records");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.leave_type || !form.start_date || !form.end_date || !form.reason) {
      toast.warning("All fields are required!");
      return;
    }

    try {
      await submitLeave(form);
      toast.success("Leave submitted successfully");
      setForm({ leave_type: "", start_date: "", end_date: "", reason: "" });
      loadLeaves();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Leave application failed");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateLeaveStatus(id, status);
      toast.success(`Leave ${status}`);
      loadLeaves();
    } catch {
      toast.error("Failed to update leave status");
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Leave Management</h2>

      {/* APPLY LEAVE FORM */}
      {!isAdmin && (
        <form onSubmit={handleSubmit} className="leave-form">
          <input
            placeholder="Leave Type"
            value={form.leave_type}
            onChange={e => setForm({ ...form, leave_type: e.target.value })}
          />
          <input
            type="date"
            value={form.start_date}
            onChange={e => setForm({ ...form, start_date: e.target.value })}
          />
          <input
            type="date"
            value={form.end_date}
            onChange={e => setForm({ ...form, end_date: e.target.value })}
          />
          <textarea
            placeholder="Reason"
            value={form.reason}
            onChange={e => setForm({ ...form, reason: e.target.value })}
          />
          <button type="submit">Apply Leave</button>
        </form>
      )}

      {/* LEAVE LIST */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Dates</th>
            <th>Status</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {leaves.length === 0 && (
            <tr><td colSpan="4">No leave records found</td></tr>
          )}
          {leaves.map(l => (
            <tr key={l.id}>
              <td>{l.user_name || "You"}</td>
              <td>{l.start_date} → {l.end_date}</td>
              <td>
                <span className={`status-badge ${l.status.toLowerCase()}`}>
                  {l.status}
                </span>
              </td>
              {isAdmin && (
                <td>
                  <button onClick={() => handleStatusChange(l.id, "Approved")}>Approve</button>
                  <button onClick={() => handleStatusChange(l.id, "Rejected")}>Reject</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
