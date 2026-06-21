import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";
import "./Users.css";

const API_BASE = import.meta.env.VITE_API_BASE || "https://shivaamfarmsandresorts-villa-software-1.onrender.com";

const EMPTY_FORM = { name: "", email: "", password: "", role: "staff" };

// ─── Reusable password input ──────────────────────────────────────────────────
function PasswordInput({ value, onChange, placeholder = "Password", required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-group">
      <input
        type={show ? "text" : "password"}
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete="new-password"
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const cls =
    role === "admin"   ? "bg-danger"         :
    role === "manager" ? "bg-warning text-dark" :
                         "bg-success";
  return (
    <span className={`badge ${cls} text-capitalize`}>{role}</span>
  );
}

export default function Users() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // user being edited
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editForm, setEditForm]   = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch all users ──────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/users`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setUsers(data.data || []);
      else toast.error(data.message || "Failed to load users.");
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── Create user ──────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res  = await fetch(`${API_BASE}/api/users`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.message); return; }
      toast.success(`User "${data.data.name}" created.`);
      setShowCreate(false);
      setForm(EMPTY_FORM);
      fetchUsers();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Update user ──────────────────────────────────────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const payload = {
        name:      editForm.name,
        email:     editForm.email,
        role:      editForm.role,
        is_active: editForm.is_active,
      };
      if (editForm.newPassword) payload.password = editForm.newPassword;

      const res  = await fetch(`${API_BASE}/api/users/${editTarget.id}`, {
        method:      "PUT",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.message); return; }
      toast.success("User updated.");
      setEditTarget(null);
      fetchUsers();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete user ──────────────────────────────────────────────────────────
  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    try {
      const res  = await fetch(`${API_BASE}/api/users/${user.id}`, {
        method:      "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      toast.success("User deleted.");
      fetchUsers();
    } catch {
      toast.error("Delete failed.");
    }
  };

  const openEdit = (user) => {
    setFormError("");
    setEditForm({ ...user, newPassword: "" });
    setEditTarget(user);
  };

  const cancelCreate = () => { setShowCreate(false); setForm(EMPTY_FORM); setFormError(""); };
  const cancelEdit   = () => { setEditTarget(null); setFormError(""); };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <div className="text-center">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-3">Loading users…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <FiUsers /> User Management
          </h3>
          <p className="text-muted mb-0">Create and manage login accounts for managers and staff</p>
        </div>
        <button
          className="btn btn-success d-flex align-items-center"
          onClick={() => { setFormError(""); setShowCreate(true); }}
        >
          <FaPlus className="me-2" /> New User
        </button>
      </div>

      {/* Users table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-semibold">{u.name}</td>
                      <td>{u.email}</td>
                      <td><RoleBadge role={u.role} /></td>
                      <td>
                        <span className={`badge ${u.is_active ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}>
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="text-center">
                        {u.role !== "admin" && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => openEdit(u)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(u)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                        {u.role === "admin" && (
                          <span className="text-muted small">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Create User Modal ──────────────────────────────────────────────── */}
      {showCreate && (
        <div className="modal fade show d-block users-modal-backdrop" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Create New User</h5>
                <button type="button" className="btn-close btn-close-white" onClick={cancelCreate} />
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger py-2">{formError}</div>
                  )}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. rahul@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Password</label>
                    <PasswordInput
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                    <div className="form-text">Minimum 6 characters.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Role</label>
                    <select
                      className="form-select"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </select>
                    <div className="form-text">
                      <b>Manager:</b> booking + calendar + villas + edit bookings.&nbsp;
                      <b>Staff:</b> view + create bookings + calendar only.
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cancelCreate}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success" disabled={submitting}>
                    {submitting ? "Creating…" : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit User Modal ────────────────────────────────────────────────── */}
      {editTarget && (
        <div className="modal fade show d-block users-modal-backdrop" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Edit User — {editTarget.name}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={cancelEdit} />
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger py-2">{formError}</div>
                  )}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">New Password</label>
                    <PasswordInput
                      value={editForm.newPassword || ""}
                      onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Role</label>
                    <select
                      className="form-select"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    >
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Status</label>
                    <select
                      className="form-select"
                      value={editForm.is_active ? "active" : "inactive"}
                      onChange={(e) =>
                        setEditForm({ ...editForm, is_active: e.target.value === "active" })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive (disabled)</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
