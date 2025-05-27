import React from "react";
import { useState } from "react";
import { login } from "../api/api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    const res = await login(form);
    if (res.token) {
      setUser(res.user, res.token);
      navigate("/");
    } else {
      setError(res.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border rounded px-3 py-2" required />
        <button className="bg-blue-600 text-white py-2 rounded">Login</button>
      </form>
    </div>
  );
}