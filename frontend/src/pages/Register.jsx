import React, { useState } from "react";
import { register } from "../api/api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const ROLES = [
  { label: "Buyer", value: "buyer" },
  { label: "Vendor", value: "vendor" },
];

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "buyer",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await register(form);
    setLoading(false);
    if (res.token) {
      setUser(res.user, res.token);
      navigate("/");
    } else {
      setError(res.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input name="firstName" type="text" placeholder="First Name" value={form.firstName} onChange={handleChange} className="border rounded px-3 py-2 w-1/2" required minLength={2} />
          <input name="lastName" type="text" placeholder="Last Name" value={form.lastName} onChange={handleChange} className="border rounded px-3 py-2 w-1/2" required minLength={2} />
        </div>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2" required />
        <input name="password" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} className="border rounded px-3 py-2" required minLength={6} />
        <input name="phoneNumber" type="tel" placeholder="Phone Number (e.g. +1234567890)" value={form.phoneNumber} onChange={handleChange} className="border rounded px-3 py-2" required />
        <select name="role" value={form.role} onChange={handleChange} className="border rounded px-3 py-2" required>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <button className="bg-blue-600 text-white py-2 rounded font-semibold" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
      </form>
      <div className="text-sm text-gray-600 mt-4">Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a></div>
    </div>
  );
}