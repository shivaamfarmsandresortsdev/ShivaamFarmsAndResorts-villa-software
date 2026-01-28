import React, { useEffect, useState } from "react";
import axios from "axios";

// ✅ Works both locally + deployed
const API_BASE =
    import.meta.env.VITE_API_BASE ||
    "https://shivaam-farms-and-resorts-villa-1.onrender.com";

const Villas = () => {
    const [villas, setVillas] = useState([]);

    // Add form
    const [name, setName] = useState("");
    const [type, setType] = useState("Villa");
    const [capacity, setCapacity] = useState("");

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        name: "",
        type: "Villa",
        capacity: "",
    });

    const fetchVillas = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/villas`);
            setVillas(res.data.data || []);
        } catch (err) {
            console.error("❌ Failed to fetch villas:", err?.response?.data || err.message);
            alert("Failed to load villas");
        }
    };

    useEffect(() => {
        fetchVillas();
    }, []);

    // ✅ ADD VILLA
    const addVilla = async (e) => {
        e.preventDefault();
        if (!name.trim()) return alert("Villa name required");

        try {
            await axios.post(`${API_BASE}/api/villas`, {
                name,
                type,
                capacity,
            });

            setName("");
            setCapacity("");
            await fetchVillas();
        } catch (err) {
            console.error("❌ Add villa failed:", err?.response?.data || err.message);
            alert("Add villa failed: " + (err?.response?.data?.error || err.message));
        }
    };

    // ✅ DELETE VILLA
    const deleteVilla = async (id) => {
        if (!confirm("Delete this villa?")) return;

        try {
            await axios.delete(`${API_BASE}/api/villas/${id}`);
            await fetchVillas();
        } catch (err) {
            console.error("❌ Delete villa failed:", err?.response?.data || err.message);
            alert("Delete failed");
        }
    };

    // ✅ START EDIT
    const startEdit = (villa) => {
        setEditingId(villa.id);
        setEditData({
            name: villa.name || "",
            type: villa.type || "Villa",
            capacity: villa.capacity ?? "",
        });
    };

    // ✅ CANCEL EDIT
    const cancelEdit = () => {
        setEditingId(null);
        setEditData({ name: "", type: "Villa", capacity: "" });
    };

    // ✅ SAVE EDIT
    const saveEdit = async (id) => {
        if (!editData.name.trim()) {
            alert("Villa name required");
            return;
        }

        try {
            await axios.put(`${API_BASE}/api/villas/${id}`, {
                name: editData.name,
                type: editData.type,
                capacity: editData.capacity === "" ? null : Number(editData.capacity),
            });

            setEditingId(null);
            await fetchVillas();
            alert("✅ Villa updated");
        } catch (err) {
            console.error("❌ Update villa failed:", err?.response?.data || err.message);
            alert("Update failed: " + (err?.response?.data?.error || err.message));
        }
    };

    return (
        <div className="container mt-3">
            <h4 className="fw-bold mb-3">Manage Villas</h4>

            {/* ✅ Add Villa */}
            <form onSubmit={addVilla} className="row g-2 mb-4">
                <div className="col-md-4">
                    <input
                        className="form-control"
                        placeholder="Villa Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="Villa">Villa</option>
                        <option value="Cottage">Cottage</option>
                        <option value="Dormitory">Dormitory</option>
                    </select>
                </div>

                <div className="col-md-3">
                    <input
                        className="form-control"
                        type="number"
                        placeholder="Capacity"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                    />
                </div>

                <div className="col-md-2">
                    <button className="btn btn-primary w-100">Add</button>
                </div>
            </form>

            {/* ✅ Villas List */}
            <div className="card shadow-sm">
                <div className="card-body">
                    {villas.length === 0 ? (
                        <p className="text-muted">No villas found</p>
                    ) : (
                        <table className="table align-middle">
                            <thead>
                                <tr>
                                    <th style={{ width: "35%" }}>Villa</th>
                                    <th style={{ width: "20%" }}>Type</th>
                                    <th style={{ width: "15%" }}>Capacity</th>
                                    <th style={{ width: "30%" }} className="text-end">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {villas.map((v) => {
                                    const isEditing = editingId === v.id;

                                    return (
                                        <tr key={v.id}>
                                            {/* Villa Name */}
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        className="form-control"
                                                        value={editData.name}
                                                        onChange={(e) =>
                                                            setEditData((p) => ({ ...p, name: e.target.value }))
                                                        }
                                                    />
                                                ) : (
                                                    v.name
                                                )}
                                            </td>

                                            {/* Type */}
                                            <td>
                                                {isEditing ? (
                                                    <select
                                                        className="form-select"
                                                        value={editData.type}
                                                        onChange={(e) =>
                                                            setEditData((p) => ({ ...p, type: e.target.value }))
                                                        }
                                                    >
                                                        <option value="Villa">Villa</option>
                                                        <option value="Cottage">Cottage</option>
                                                        <option value="Dormitory">Dormitory</option>
                                                    </select>
                                                ) : (
                                                    v.type || "-"
                                                )}
                                            </td>

                                            {/* Capacity */}
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        className="form-control"
                                                        type="number"
                                                        value={editData.capacity}
                                                        onChange={(e) =>
                                                            setEditData((p) => ({
                                                                ...p,
                                                                capacity: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                ) : (
                                                    v.capacity ?? "-"
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="text-end">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            className="btn btn-success btn-sm me-2"
                                                            type="button"
                                                            onClick={() => saveEdit(v.id)}
                                                        >
                                                            Save
                                                        </button>

                                                        <button
                                                            className="btn btn-outline-secondary btn-sm"
                                                            type="button"
                                                            onClick={cancelEdit}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            type="button"
                                                            onClick={() => startEdit(v)}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            type="button"
                                                            onClick={() => deleteVilla(v.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Villas;
