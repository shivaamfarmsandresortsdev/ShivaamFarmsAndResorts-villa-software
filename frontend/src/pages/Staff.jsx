import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getStaff,
  addStaff,
  updateStaff,
  deleteStaff,
} from "../service/staffApi";

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ name: "", role: "", contact: "", joiningdate: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch staff
  const fetchStaff = async () => {
    try {
      const data = await getStaff();
      setStaff(data);
    } catch (err) {
      toast.error(`Failed to fetch staff: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update
  const handleSave = async () => {
    if (!form.name || !form.role || !form.contact || !form.joiningdate) {
      toast.error("Please fill in all fields!");
      return;
    }

    try {
      if (editIndex !== null) {
        await updateStaff(staff[editIndex].id, form);
        toast.success("Staff updated!");
      } else {
        await addStaff(form);
        toast.success("Staff added!");
      }
      setForm({ name: "", role: "", contact: "", joiningdate: "" });
      setEditIndex(null);
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
    }
  };

  // Edit
  const handleEdit = (index) => {
    setForm(staff[index]);
    setEditIndex(index);
    setShowModal(true);
  };

  // Delete
  const handleDelete = async () => {
    try {
      await deleteStaff(staff[confirmDeleteIndex].id);
      toast.success("Staff deleted!");
      setConfirmDeleteIndex(null);
      fetchStaff();
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (staff.length === 0) return toast.error("No staff to export!");

    const headers = ["Name", "Role", "Contact", "Joining Date"];
    const rows = staff.map((s) => [
      s.name,
      s.role,
      s.contact,
      s.joiningdate ? new Date(s.joiningdate).toLocaleDateString("en-GB") : "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "staff.csv";
    link.click();
    toast.success("CSV exported!");
  };

  // Search filter
  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container my-4">
      <h2>Staff Management</h2>
      <p className="text-muted">Manage your Restaurant staff</p>

      {/* Card */}
      <div className="card mb-3 shadow-sm" style={{ width: "18rem" }}>
        <div className="card-body text-center">
          <h5>Total Staff</h5>
          <p className="display-6">{staff.length}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <input
          className="form-control mb-2"
          placeholder="Search staff..."
          style={{ maxWidth: "300px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="d-flex gap-2 mb-2">
          <button className="btn btn-success" onClick={() => setShowModal(true)}>
            + Add Staff
          </button>
          <button className="btn btn-outline-primary" onClick={handleExportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover table-bordered">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Contact</th>
              <th>Joining Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.role}</td>
                <td>📞 {s.contact}</td>
                <td>
                  {s.joiningdate
                    ? new Date(s.joiningdate).toLocaleDateString("en-GB")
                    : ""}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => handleEdit(i)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setConfirmDeleteIndex(i)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editIndex !== null ? "Edit Staff" : "Add Staff"}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                />
                <select
                  className="form-select mb-2"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="">Select Role</option>
                  <option>Villa Manager</option>
                  <option>Security</option>
                  <option>Maintainance</option>
                  <option>Housekeeping</option>
                </select>
                <input
                  className="form-control mb-2"
                  name="contact"
                  placeholder="Contact"
                  value={form.contact}
                  onChange={handleChange}
                />
                <input
                  type="date"
                  className="form-control"
                  name="joiningdate"
                  value={form.joiningdate}
                  onChange={handleChange}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleSave}>
                  {editIndex !== null ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDeleteIndex !== null && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Confirm Delete</h5>
                <button
                  className="btn-close"
                  onClick={() => setConfirmDeleteIndex(null)}
                />
              </div>
              <div className="modal-body">
                <p>Delete {staff[confirmDeleteIndex]?.name}?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmDeleteIndex(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
