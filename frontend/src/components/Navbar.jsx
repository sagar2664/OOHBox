import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (
    <>
      <Link to="/" className="hover:text-blue-600" onClick={() => setMenuOpen(false)}>Home</Link>
      <Link to="/search" className="hover:text-blue-600" onClick={() => setMenuOpen(false)}>Search</Link>
      <Link to="/map-test" className="hover:text-blue-600" onClick={() => setMenuOpen(false)}>Map Test</Link>
      {user && user.role === "vendor" && (
        <Link to="/vendor-dashboard" className="hover:text-blue-600" onClick={() => setMenuOpen(false)}>Vendor Dashboard</Link>
      )}
      {user && user.role === "admin" && (
        <Link to="/admin" className="hover:text-blue-600" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
      )}
      {user && <Link to="/my-bookings" className="hover:text-blue-600" onClick={() => setMenuOpen(false)}>My Bookings</Link>}
      {user ? (
        <>
          <Link to="/profile" className="hover:text-blue-600" onClick={() => setMenuOpen(false)}>{user.firstName}</Link>
          <button onClick={() => { logout(); setMenuOpen(false); }} className="ml-2 px-3 py-1 bg-gray-200 rounded">Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" className="px-4 py-1 border rounded text-blue-600 border-blue-600 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/register" className="px-4 py-1 border rounded text-white bg-blue-600 hover:bg-blue-700" onClick={() => setMenuOpen(false)}>Register</Link>
        </>
      )}
    </>
  );

  return (
    <nav className="bg-white shadow flex items-center justify-between px-4 md:px-8 py-3 relative">
      <Link to="/" className="text-blue-600 font-bold text-xl">OOHBox</Link>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
        onClick={() => setMenuOpen(m => !m)}
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-blue-600 mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-blue-600 mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-blue-600 transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
      </button>
      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">{navLinks}</div>
      {/* Mobile nav dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col gap-4 px-4 py-4 z-50 md:hidden animate-fade-in">
          {navLinks}
        </div>
      )}
    </nav>
  );
}