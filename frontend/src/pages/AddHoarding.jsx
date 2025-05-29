import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHoarding } from '../api/api';
import { useAuth } from '../hooks/useAuth';

const HOARDING_TYPES = [
  { value: '', label: 'Select Hoarding Type' },
  { value: 'billboard', label: 'Billboard' },
  { value: 'digital', label: 'Digital' },
  { value: 'wall', label: 'Wall' },
  { value: 'other', label: 'Other' },
];

export default function AddHoarding() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    specs: { width: '', height: '', type: '' },
    price: '',
    location: { address: '', city: '', state: '', coordinates: { coordinates: ['', ''] } },
    image: null,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in form.specs) {
      setForm(f => ({ ...f, specs: { ...f.specs, [name]: value } }));
    } else if (name in form.location) {
      setForm(f => ({ ...f, location: { ...f.location, [name]: value } }));
    } else if (name === 'latitude' || name === 'longitude') {
      setForm(f => ({
        ...f,
        location: {
          ...f.location,
          coordinates: {
            ...f.location.coordinates,
            coordinates: [
              name === 'longitude' ? value : f.location.coordinates.coordinates[0],
              name === 'latitude' ? value : f.location.coordinates.coordinates[1],
            ],
          },
        },
      }));
    } else if (name === 'image') {
      setForm(f => ({ ...f, image: e.target.files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Validation
    if (!form.name || !form.description || !form.specs.width || !form.specs.height || !form.specs.type || !form.price || !form.location.address || !form.location.city || !form.location.state || !form.location.coordinates.coordinates[0] || !form.location.coordinates.coordinates[1] || !form.image) {
      setError('Please fill all required fields and upload an image.');
      setLoading(false);
      return;
    }
    try {
      const payload = {
        name: form.name,
        description: form.description,
        specs: {
          width: Number(form.specs.width),
          height: Number(form.specs.height),
          type: form.specs.type,
        },
        price: Number(form.price),
        location: {
          address: form.location.address,
          city: form.location.city,
          state: form.location.state,
          coordinates: {
            type: 'Point',
            coordinates: [
              Number(form.location.coordinates.coordinates[0]),
              Number(form.location.coordinates.coordinates[1]),
            ],
          },
        },
      };
      await createHoarding(payload, form.image, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="text-sm text-gray-500 mb-2">Home / Add New Hoarding</div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">Add New Hoarding <span className="text-blue-600">+</span></h1>
      <form className="bg-white rounded shadow p-6 flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div>
          <label className="block font-semibold mb-1">Name<span className="text-red-500">*</span></label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2 mb-2" placeholder="e.g. Main Street Billboard A" required />
          <label className="block font-semibold mb-1">Description<span className="text-red-500">*</span></label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Describe the hoarding" required rows={3} />
        </div>
        {/* Specs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1">Width* (ft)</label>
            <input name="width" value={form.specs.width} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. 20" required type="number" min="1" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Height* (ft)</label>
            <input name="height" value={form.specs.height} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. 10" required type="number" min="1" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Type*</label>
            <select name="type" value={form.specs.type} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
              {HOARDING_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
        {/* Price */}
        <div>
          <label className="block font-semibold mb-1">Price* (per month, ₹)</label>
          <input name="price" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. 5000" required type="number" min="0" />
        </div>
        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Address*</label>
            <input name="address" value={form.location.address} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. 123 Main St, Near Landmark" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">City*</label>
            <input name="city" value={form.location.city} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. Mumbai" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">State*</label>
            <input name="state" value={form.location.state} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. Maharashtra" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Latitude*</label>
            <input name="latitude" value={form.location.coordinates.coordinates[1]} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. 19.0760" required type="number" step="any" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Longitude*</label>
            <input name="longitude" value={form.location.coordinates.coordinates[0]} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. 72.8777" required type="number" step="any" />
          </div>
        </div>
        {/* Image */}
        <div>
          <label className="block font-semibold mb-1">Upload Hoarding Image<span className="text-red-500">*</span></label>
          <input name="image" type="file" accept="image/*" onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          <div className="text-xs text-gray-500 mt-1">Upload 1 image. Max file size: 5MB.</div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold mt-2" disabled={loading}>{loading ? 'Creating...' : 'Create Hoarding'}</button>
      </form>
    </div>
  );
} 