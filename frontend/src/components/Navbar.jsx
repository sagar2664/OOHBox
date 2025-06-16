import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/images/oohbox-logo.jpg";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Refined nav links for better UX
  const navLinks = (
    <>
      {(!user || (user && user.role === "buyer")) && (
        <Link to="/" className={`px-2 py-2 text-gray-600 font-medium transition-colors duration-300 hover:text-blue-600 ${isActive('/') ? 'text-blue-600' : ''}`} onClick={() => setMenuOpen(false)}>
          Home
        </Link>
      )}
      {(!user || (user && user.role === "buyer")) && (
        <Link to="/search" className={`px-2 py-2 text-gray-600 font-medium transition-colors duration-300 hover:text-blue-600 ${isActive('/search') ? 'text-blue-600' : ''}`} onClick={() => setMenuOpen(false)}>
          Find Ad Spaces
        </Link>
      )}
      {/* You can add a link for media owners */}
      <Link to="/for-media-owners" className={`px-2 py-2 text-gray-600 font-medium transition-colors duration-300 hover:text-blue-600 ${isActive('/for-media-owners') ? 'text-blue-600' : ''}`} onClick={() => setMenuOpen(false)}>
        For Media Owners
      </Link>
      
      {user && user.role === "vendor" && (
        <Link to="/vendor-dashboard" className={`px-2 py-2 text-gray-600 font-medium transition-colors duration-300 hover:text-blue-600 ${isActive('/vendor-dashboard') ? 'text-blue-600' : ''}`} onClick={() => setMenuOpen(false)}>
          Vendor Dashboard
        </Link>
      )}
      {user && user.role === "admin" && (
        <Link to="/admin" className={`px-2 py-2 text-gray-600 font-medium transition-colors duration-300 hover:text-blue-600 ${isActive('/admin') ? 'text-blue-600' : ''}`} onClick={() => setMenuOpen(false)}>
          Admin Dashboard
        </Link>
      )}
      {user && user.role === "buyer" && (
        <Link to="/my-bookings" className={`px-2 py-2 text-gray-600 font-medium transition-colors duration-300 hover:text-blue-600 ${isActive('/my-bookings') ? 'text-blue-600' : ''}`} onClick={() => setMenuOpen(false)}>
          My Bookings
        </Link>
      )}
      {user && (
        <Link to="/profile" className={`px-2 py-2 text-gray-600 font-medium transition-colors duration-300 hover:text-blue-600 ${isActive('/profile') ? 'text-blue-600' : ''}`} onClick={() => setMenuOpen(false)}>
          {user.firstName}
        </Link>
      )}
    </>
  );

  const authButtons = (
    <>
      {user ? (
        <button onClick={() => { logout(); setMenuOpen(false); }} className="px-4 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-all">
          Logout
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <Link to="/login" className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors" onClick={() => setMenuOpen(false)}>
            Login
          </Link>
          <Link to="/register" className="px-4 py-2 border rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-sm" onClick={() => setMenuOpen(false)}>
            Register
          </Link>
        </div>
      )}
    </>
  );

  return (
    <nav className="bg-gray-200/80 backdrop-blur-md shadow-sm sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-3">
      <Link to="/" className="flex items-center">
        <img src={logo} alt="OOHBox Logo" className="h-10 w-auto" />
      </Link>
      
      <div className="hidden md:flex items-center gap-6">
        {navLinks}
      </div>

      <div className="hidden md:flex items-center gap-4">
        {authButtons}
      </div>

      <button
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none z-50"
        onClick={() => setMenuOpen(m => !m)}
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-blue-600 mb-1 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-blue-600 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-blue-600 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
      </button>

      {menuOpen && (
        <div className="absolute top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center gap-6 text-xl animate-fade-in-down md:hidden">
          {navLinks}
          <div className="mt-4">
            {authButtons}
          </div>
        </div>
      )}
    </nav>
  );
}