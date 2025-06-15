import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/images/oohbox-logo.jpg"

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = (
    <>
      {(!user || (user && user.role === "buyer")) && (
        <Link 
          to="/" 
          className={`hover:text-blue-600 ${isActive('/') ? 'text-blue-600 border-b-2 border-blue-600' : ''}`} 
          onClick={() => setMenuOpen(false)}
        >
          Home
        </Link>
      )}

      {(!user || (user && user.role === "buyer")) && (
        <Link 
          to="/search" 
          className={`hover:text-blue-600 ${isActive('/search') ? 'text-blue-600 border-b-2 border-blue-600' : ''}`} 
          onClick={() => setMenuOpen(false)}
        >
          Search
        </Link>
      )}
      
      {user && user.role === "vendor" && (
        <Link 
          to="/vendor-dashboard" 
          className={`hover:text-blue-600 ${isActive('/vendor-dashboard') ? 'text-blue-600 border-b-2 border-blue-600' : ''}`} 
          onClick={() => setMenuOpen(false)}
        >
          Vendor Dashboard
        </Link>
      )}

      {user && user.role === "admin" && (
        <Link 
          to="/admin" 
          className={`hover:text-blue-600 ${isActive('/admin') ? 'text-blue-600 border-b-2 border-blue-600' : ''}`} 
          onClick={() => setMenuOpen(false)}
        >
          Admin Dashboard
        </Link>
      )}

      {user && user.role === "buyer" && (
        <Link 
          to="/my-bookings" 
          className={`hover:text-blue-600 ${isActive('/my-bookings') ? 'text-blue-600 border-b-2 border-blue-600' : ''}`} 
          onClick={() => setMenuOpen(false)}
        >
          My Bookings
        </Link>
      )}
      
      {user && (
        <Link 
          to="/profile" 
          className={`hover:text-blue-600 ${isActive('/profile') ? 'text-blue-600 border-b-2 border-blue-600' : ''}`} 
          onClick={() => setMenuOpen(false)}
        >
          {user.firstName}
        </Link>
      )}
    </>
  );

  const authButtons = (
    <>
      {user ? (
        <button onClick={() => { logout(); setMenuOpen(false); }} className="px-3 py-1 bg-gray-200 rounded">Logout</button>
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
      <Link to="/" className="flex items-center">
        <img src={logo} alt="OOHBox Logo" className="h-10 w-auto" />
      </Link>
      
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
      <div className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
        {navLinks}
      </div>

      {/* Auth buttons - desktop */}
      <div className="hidden md:flex items-center gap-4">
        {authButtons}
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col gap-4 px-4 py-4 z-50 md:hidden animate-fade-in">
          {navLinks}
          <div className="flex gap-4 mt-2">
            {authButtons}
          </div>
        </div>
      )}
    </nav>
  );
}