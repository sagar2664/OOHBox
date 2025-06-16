import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { getProfile, updateProfile } from "../api/api";

// --- Reusable Icon Component for UI elements ---
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
    </svg>
);

// --- Sidebar Navigation Link ---
const SidebarLink = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
            isActive
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
    >
        <div className="mr-3">{icon}</div>
        {label}
    </button>
);

// =================================================================================
// MAIN PROFILE COMPONENT
// =================================================================================
export default function Profile() {
    const { user, token, setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [activeSection, setActiveSection] = useState("profile"); // For sidebar navigation
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        // Add a placeholder for profile picture
        profilePictureUrl: user?.profilePictureUrl || "", 
    });

    // Original useEffect logic preserved
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const data = await getProfile(token);
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                    phoneNumber: data.phoneNumber || "",
                    profilePictureUrl: data.profilePictureUrl || user?.profilePictureUrl || "",
                });
                setError("");
            } catch (err) {
                setError(err.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token, user?.profilePictureUrl]);

    // Original handleChange logic preserved
    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // Original handleSubmit logic preserved
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            // Note: Profile picture upload would require a separate function and API endpoint
            const dataToUpdate = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
            };
            const data = await updateProfile(dataToUpdate, token);
            setSuccess("Profile updated successfully!");
            setUser({ ...user, ...data.user });
            setIsEditing(false);
        } catch (err) {
            setError(err.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };
    
    // Skeleton loader with enhanced styling
    if (loading && !formData.firstName) {
        return (
            <div className="max-w-screen-lg mx-auto px-4 py-8 animate-pulse">
                <div className="h-9 bg-gray-200 rounded w-1/4 mb-10"></div>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/4">
                        <div className="h-12 bg-gray-200 rounded-lg mb-2"></div>
                        <div className="h-12 bg-gray-200 rounded-lg mb-2"></div>
                    </div>
                    <div className="w-full md:w-3/4">
                        <div className="bg-gray-200 h-64 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-screen-lg mx-auto px-4 py-8"
            >
                <header className="mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Account Settings</h1>
                    <p className="mt-1 text-gray-500">Manage your profile, security, and notification settings.</p>
                </header>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                    {/* --- Sidebar --- */}
                    <aside className="w-full md:w-1/4">
                        <div className="space-y-2">
                            <SidebarLink
                                label="Profile"
                                icon={<Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                                isActive={activeSection === 'profile'}
                                onClick={() => setActiveSection('profile')}
                            />
                            <SidebarLink
                                label="Security"
                                icon={<Icon path="M12 15v2m-6.41-1.41l-1.42 1.42M4 12H2m1.41-6.41L2 4.17m1.42-1.42L4.83 4M12 2v2m6.41 1.41l1.42-1.42M20 12h2m-1.41 6.41l1.42 1.42M12 22v-2" />}
                                isActive={activeSection === 'security'}
                                onClick={() => setActiveSection('security')}
                            />
                            <SidebarLink
                                label="Notifications"
                                icon={<Icon path="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />}
                                isActive={activeSection === 'notifications'}
                                onClick={() => setActiveSection('notifications')}
                            />
                        </div>
                    </aside>

                    {/* --- Main Content --- */}
                    <main className="w-full md:w-3/4">
                        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">{error}</div>}
                        {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6">{success}</div>}

                        {isEditing ? (
                            // --- EDITING VIEW ---
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
                                            <p className="text-gray-500">Update your personal information below.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name</label><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required /></div>
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required /></div>
                                    </div>
                                    <div className="mt-6"><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed" required disabled /></div>
                                    <div className="mt-6"><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required /></div>
                                    <div className="pt-8 flex gap-4 border-t border-gray-200 mt-8">
                                        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50">{loading ? "Saving..." : "Save Changes"}</button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-md font-semibold hover:bg-gray-200 transition">Cancel</button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            // --- DISPLAY VIEW ---
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                                            <p className="text-gray-500">Your personal details and contact information.</p>
                                        </div>
                                        <button onClick={() => setIsEditing(true)} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200 transition text-sm">Edit</button>
                                    </div>
                                    
                                    <div className="flex items-center mb-8">
                                        <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl font-bold mr-6 flex-shrink-0">
                                            {formData.firstName?.[0]}{formData.lastName?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-gray-900">{formData.firstName} {formData.lastName}</p>
                                            <p className="text-gray-500">{formData.email}</p>
                                        </div>
                                        <button className="ml-auto text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-200">Upload Picture</button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div><p className="text-sm text-gray-500">First Name</p><p className="font-semibold text-lg text-gray-800">{formData.firstName}</p></div>
                                        <div><p className="text-sm text-gray-500">Last Name</p><p className="font-semibold text-lg text-gray-800">{formData.lastName}</p></div>
                                        <div><p className="text-sm text-gray-500">Phone Number</p><p className="font-semibold text-lg text-gray-800">{formData.phoneNumber}</p></div>
                                        <div><p className="text-sm text-gray-500">Role</p><p className="font-semibold text-lg text-gray-800 capitalize bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full inline-block">{user?.role}</p></div>
                                        <div><p className="text-sm text-gray-500">Member Since</p><p className="font-semibold text-lg text-gray-800">{new Date(user?.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </main>
                </div>
            </motion.div>
        </div>
    );
}