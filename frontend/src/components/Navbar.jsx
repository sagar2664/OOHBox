import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-white shadow flex items-center justify-between px-8 py-3">
      <Link to="/" className="text-blue-600 font-bold text-xl">OOHBox</Link>
      <div className="flex items-center gap-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/search" className="hover:text-blue-600">Search</Link>
        {user && <Link to="/my-bookings" className="hover:text-blue-600">My Bookings</Link>}
        {user ? (
          <>
            <Link to="/profile" className="hover:text-blue-600">{user.firstName}</Link>
            <button onClick={logout} className="ml-2 px-3 py-1 bg-gray-200 rounded">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-4 py-1 border rounded text-blue-600 border-blue-600 hover:bg-blue-50">Login</Link>
            <Link to="/register" className="px-4 py-1 border rounded text-white bg-blue-600 hover:bg-blue-700">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}