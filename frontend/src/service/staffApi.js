const API_BASE = import.meta.env.VITE_API_BASE || "https://api.shivaamfarmsandresorts.com";
const API_URL  = `${API_BASE}/api/staff`;

const opts = (method, body) => ({
  method,
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

export const getStaff = async () => {
  const res = await fetch(API_URL, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
};

export const addStaff = async (staff) => {
  const res = await fetch(API_URL, opts("POST", staff));
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
};

export const updateStaff = async (id, staff) => {
  const res = await fetch(`${API_URL}/${id}`, opts("PUT", staff));
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
};

export const deleteStaff = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE", credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
};
