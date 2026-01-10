import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://shivaam-farms-and-resorts-villa-kynh.onrender.com";

const Villas = () => {
  const [villas, setVillas] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("Villa");
  const [capacity, setCapacity] = useState("");

  const fetchVillas = async () => {
    const res = await axios.get(`${API_BASE}/api/villas`);
    setVillas(res.data.data || []);
  };

  useEffect(() => {
    fetchVillas();
  }, []);

  const addVilla = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Villa name required");

    await axios.post(`${API_BASE}/api/villas`, {
      name,
      type,
      capacity,
    });

    setName("");
    setCapacity("");
    await fetchVillas();
  };

  const deleteVilla = async (id) => {
    if (!confirm("Delete this villa?")) return;
    await axios.delete(`${API_BASE}/api/villas/${id}`);
    await fetchVillas();
  };

  return (
    <div className="container mt-3">
      <h4 className="fw-bold mb-3">Manage Villas</h4>

      {/* Add Villa */}
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

      {/* Villas List */}
      <div className="card shadow-sm">
        <div className="card-body">
          {villas.length === 0 ? (
            <p className="text-muted">No villas found</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Villa</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {villas.map((v) => (
                  <tr key={v.id}>
                    <td>{v.name}</td>
                    <td>{v.type || "-"}</td>
                    <td>{v.capacity ?? "-"}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteVilla(v.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Villas;
