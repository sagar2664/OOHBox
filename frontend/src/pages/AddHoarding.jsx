import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHoarding } from '../api/api';
import { useAuth } from '../hooks/useAuth';

const HOARDING_TYPES = [
  { value: 'Static Billboard', label: 'Static Billboard' },
  { value: 'Digital OOH (DOOH)', label: 'Digital OOH (DOOH)' },
  { value: 'Transit', label: 'Transit' },
  { value: 'Street Furniture', label: 'Street Furniture' },
  { value: 'Wallscape', label: 'Wallscape' },
  { value: 'Gantry', label: 'Gantry' },
  { value: 'Other', label: 'Other' },
];

const ILLUMINATION_TYPES = [
  { value: 'Backlit', label: 'Backlit' },
  { value: 'Frontlit', label: 'Frontlit' },
  { value: 'Digital', label: 'Digital' },
  { value: 'Non-Illuminated', label: 'Non-Illuminated' },
];

const PRICING_MODELS = [
  { value: 'Flat Rate', label: 'Flat Rate' },
  { value: 'Impression-based', label: 'Impression-based' },
  { value: 'Programmatic', label: 'Programmatic' },
];

const PRICING_PERIODS = [
  { value: 'day', label: 'Per Day' },
  { value: 'week', label: 'Per Week' },
  { value: 'month', label: 'Per Month' },
  { value: 'slot', label: 'Per Slot' },
];

export default function AddHoarding() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    mediaType: 'Static Billboard',
    specs: {
      width: '',
      height: '',
      units: 'ft',
      aspectRatio: '',
      orientation: '',
      illumination: 'Non-Illuminated'
    },
    digitalSpecs: {
      resolution: '',
      pixelDimensions: { width: '', height: '' }
    },
    pricing: {
      basePrice: '',
      per: 'month',
      model: 'Flat Rate',
      negotiable: false,
      additionalCosts: []
    },
    location: {
      address: '',
      landmark: '',
      area: '',
      city: '',
      state: '',
      coordinates: { coordinates: ['', ''] }
    },
    audience: {
      footfall: { volume: '', period: 'daily', source: '' },
      demographics: [],
      commutePatterns: [],
      bestSuitedFor: [],
      pointsOfInterest: []
    },
    installation: {
      leadTimeDays: '',
      accessNotes: ''
    },
    legal: {
      permitStatus: 'Pending',
      permitId: '',
      permitExpiryDate: ''
    }
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaCaptions, setMediaCaptions] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'specs' || parent === 'digitalSpecs' || parent === 'pricing' || 
          parent === 'location' || parent === 'audience' || parent === 'installation' || 
          parent === 'legal') {
        setForm(f => ({
          ...f,
          [parent]: {
            ...f[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      }
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
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }
    
    const validFiles = files.filter(file => {
      const isValid = file.size <= 50 * 1024 * 1024; // 50MB
      if (!isValid) {
        setError('File size should not exceed 50MB');
      }
      return isValid;
    });

    setMediaFiles(validFiles);
  };

  const handleCaptionChange = (index, caption) => {
    setMediaCaptions(prev => ({
      ...prev,
      [index]: caption
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(form));
      
      mediaFiles.forEach((file, index) => {
        formData.append('media', file);
        if (mediaCaptions[index]) {
          formData.append(`mediaCaptions[${index}]`, mediaCaptions[index]);
        }
      });

      await createHoarding(formData, token);
      navigate('/vendor-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-sm text-gray-500 mb-2">Home / Add New Hoarding</div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">Add New Hoarding <span className="text-blue-600">+</span></h1>
      
      <form className="bg-white rounded shadow p-6 flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>
          <div>
            <label className="block font-semibold mb-1">Name<span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Description<span className="text-red-500">*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Media Type<span className="text-red-500">*</span></label>
            <select name="mediaType" value={form.mediaType} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
              {HOARDING_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">Width<span className="text-red-500">*</span></label>
              <input name="specs.width" value={form.specs.width} onChange={handleChange} className="w-full border rounded px-3 py-2" type="number" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Height<span className="text-red-500">*</span></label>
              <input name="specs.height" value={form.specs.height} onChange={handleChange} className="w-full border rounded px-3 py-2" type="number" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Units</label>
              <select name="specs.units" value={form.specs.units} onChange={handleChange} className="w-full border rounded px-3 py-2">
                <option value="ft">Feet</option>
                <option value="m">Meters</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Illumination</label>
            <select name="specs.illumination" value={form.specs.illumination} onChange={handleChange} className="w-full border rounded px-3 py-2">
              {ILLUMINATION_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Digital Specifications (if DOOH) */}
        {form.mediaType === 'Digital OOH (DOOH)' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Digital Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Resolution</label>
                <input name="digitalSpecs.resolution" value={form.digitalSpecs.resolution} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Pixel Dimensions</label>
                <div className="grid grid-cols-2 gap-2">
                  <input name="digitalSpecs.pixelDimensions.width" value={form.digitalSpecs.pixelDimensions.width} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Width" />
                  <input name="digitalSpecs.pixelDimensions.height" value={form.digitalSpecs.pixelDimensions.height} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Height" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">Base Price<span className="text-red-500">*</span></label>
              <input name="pricing.basePrice" value={form.pricing.basePrice} onChange={handleChange} className="w-full border rounded px-3 py-2" type="number" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Per</label>
              <select name="pricing.per" value={form.pricing.per} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {PRICING_PERIODS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Pricing Model</label>
              <select name="pricing.model" value={form.pricing.model} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {PRICING_MODELS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="pricing.negotiable" checked={form.pricing.negotiable} onChange={handleChange} />
              <span>Price is negotiable</span>
            </label>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Address<span className="text-red-500">*</span></label>
              <input name="location.address" value={form.location.address} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Landmark</label>
              <input name="location.landmark" value={form.location.landmark} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Area<span className="text-red-500">*</span></label>
              <input name="location.area" value={form.location.area} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">City<span className="text-red-500">*</span></label>
              <input name="location.city" value={form.location.city} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">State<span className="text-red-500">*</span></label>
              <input name="location.state" value={form.location.state} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Latitude<span className="text-red-500">*</span></label>
              <input name="latitude" value={form.location.coordinates.coordinates[1]} onChange={handleChange} className="w-full border rounded px-3 py-2" type="number" step="any" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Longitude<span className="text-red-500">*</span></label>
              <input name="longitude" value={form.location.coordinates.coordinates[0]} onChange={handleChange} className="w-full border rounded px-3 py-2" type="number" step="any" required />
            </div>
          </div>
        </div>

        {/* Media Upload */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Media</h2>
          <div>
            <label className="block font-semibold mb-1">Upload Media<span className="text-red-500">*</span></label>
            <input type="file" multiple accept="image/*,video/*,.360" onChange={handleMediaChange} className="w-full border rounded px-3 py-2" required />
            <div className="text-xs text-gray-500 mt-1">Upload up to 5 files. Max file size: 50MB. Supported formats: Images, Videos, 360-degree views.</div>
          </div>
          {mediaFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add caption (optional)"
                value={mediaCaptions[index] || ''}
                onChange={(e) => handleCaptionChange(index, e.target.value)}
                className="flex-1 border rounded px-3 py-2"
              />
            </div>
          ))}
        </div>

        {/* Installation Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Installation Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Lead Time (Days)</label>
              <input name="installation.leadTimeDays" value={form.installation.leadTimeDays} onChange={handleChange} className="w-full border rounded px-3 py-2" type="number" min="0" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Access Notes</label>
              <textarea name="installation.accessNotes" value={form.installation.accessNotes} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} />
            </div>
          </div>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold mt-2" disabled={loading}>
          {loading ? 'Creating...' : 'Create Hoarding'}
        </button>
      </form>
    </div>
  );
} 