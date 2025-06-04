import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import HoardingDetail from "./pages/HoardingDetail";
import VendorDashboard from "./pages/VendorDashboard";
import AddHoarding from "./pages/AddHoarding";
import EditHoarding from "./pages/EditHoarding";
import BookingDetails from "./pages/BookingDetails";
import { AuthProvider } from "./hooks/useAuth";
import AdminDashboard from "./pages/AdminDashboard";
import MapTestPage from "./pages/MapTestPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/hoardings/:id" element={<HoardingDetail />} />
          <Route path="/vendor-dashboard" element={<VendorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/add-hoarding" element={<AddHoarding />} />
          <Route path="/edit-hoarding/:id" element={<EditHoarding />} />
          <Route path="/booking/:id" element={<BookingDetails />} />
          <Route path="/map-test" element={<MapTestPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
} 