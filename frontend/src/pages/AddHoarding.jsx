import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHoarding } from '../api/api';
import { useAuth } from '../hooks/useAuth';
import LocationPickerMap from '../components/LocationPickerMap';

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

const TAG_OPTIONS = [
  'Frequently Booked',
  'Popular',
  'Filling Fast',
  'New Listing',
];

export default function AddHoarding() {
  console.log('AddHoarding');
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
      illumination: 'Non-Illuminated',
    },
    digitalSpecs: {
      resolution: '',
      pixelDimensions: { width: '', height: '' },
    },
    pricing: {
      basePrice: '',
      per: 'month',
      model: 'Flat Rate',
      negotiable: false,
      additionalCosts: [],
    },
    location: {
      address: '',
      landmark: '',
      area: '',
      city: '',
      state: '',
      coordinates: { type: 'Point', coordinates: [] },
    },
    audience: {
      footfall: { volume: '', period: 'daily', source: '' },
      demographics: '',
      bestSuitedFor: '',
      commutePatterns: '',
      pointsOfInterest: '',
    },
    installation: {
      leadTimeDays: '',
      accessNotes: '',
    },
    legal: {
      permitStatus: 'Pending',
      permitId: '',
      permitExpiryDate: '',
    },
    tags: [],
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaCaptions, setMediaCaptions] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split('.');

    setForm(prevForm => {
      const newForm = JSON.parse(JSON.stringify(prevForm));
      let current = newForm;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
      return newForm;
    });
  };

  const handleLocationChange = (coords) => {
    setForm(prevForm => ({
      ...prevForm,
      location: {
        ...prevForm.location,
        coordinates: coords
          ? { type: 'Point', coordinates: [coords.lng, coords.lat] }
          : { type: 'Point', coordinates: [] },
      },
    }));
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('You can upload a maximum of 5 files.');
      return;
    }
    setMediaFiles(files);
  };
  
  const handleCaptionChange = (index, caption) => {
    setMediaCaptions(prev => ({ ...prev, [index]: caption }));
  };

  const handleTagChange = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleAdditionalCostChange = (index, field, value) => {
    setForm(prev => {
      const newCosts = [...prev.pricing.additionalCosts];
      newCosts[index][field] = field === 'isIncluded' ? value : value;
      return {
        ...prev,
        pricing: {
          ...prev.pricing,
          additionalCosts: newCosts,
        },
      };
    });
  };

  const addAdditionalCost = () => {
    setForm(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        additionalCosts: [...prev.pricing.additionalCosts, { name: '', cost: '', isIncluded: false }],
      },
    }));
  };

  const removeAdditionalCost = (index) => {
    setForm(prev => {
      const newCosts = [...prev.pricing.additionalCosts];
      newCosts.splice(index, 1);
      return {
        ...prev,
        pricing: {
          ...prev.pricing,
          additionalCosts: newCosts,
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Prepare processedForm as a plain object
      const processedForm = {
        ...form,
        audience: {
          ...form.audience,
          demographics: form.audience.demographics.split(',').map(item => item.trim()).filter(Boolean),
          bestSuitedFor: form.audience.bestSuitedFor.split(',').map(item => item.trim()).filter(Boolean),
          commutePatterns: form.audience.commutePatterns.split(',').map(item => item.trim()).filter(Boolean),
          pointsOfInterest: form.audience.pointsOfInterest.split(',').map(item => item.trim()).filter(Boolean),
        },
        tags: form.tags,
        pricing: {
          ...form.pricing,
          additionalCosts: form.pricing.additionalCosts.map(cost => ({
            ...cost,
            cost: Number(cost.cost) || 0,
          })),
        },
      };
      // Pass processedForm, mediaFiles, and token to the API helper
      await createHoarding(processedForm, mediaFiles, token);
      navigate('/vendor-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-sm text-gray-500 mb-2">Home / Add New Hoarding</div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">Add New Hoarding <span className="text-blue-600">+</span></h1>
      
      <form className="bg-white rounded shadow p-6 flex flex-col gap-6" onSubmit={handleSubmit}>
        
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

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div>
              <label className="block font-semibold mb-1">Illumination</label>
              <select name="specs.illumination" value={form.specs.illumination} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {ILLUMINATION_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {form.mediaType === 'Digital OOH (DOOH)' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Digital Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Resolution</label>
                <input name="digitalSpecs.resolution" value={form.digitalSpecs.resolution} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g., 1920x1080" />
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

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" name="pricing.negotiable" checked={form.pricing.negotiable} onChange={handleChange} />
              <span>Price is negotiable</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="mt-4">
            <label className="block font-semibold mb-1">Select Location on Map<span className="text-red-500">*</span></label>
            <LocationPickerMap
              value={
                form.location.coordinates &&
                Array.isArray(form.location.coordinates.coordinates) &&
                form.location.coordinates.coordinates.length === 2
                  ? { lat: form.location.coordinates.coordinates[1], lng: form.location.coordinates.coordinates[0] }
                  : null
              }
              onChange={coords => handleLocationChange(coords)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Audience Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                  <label className="block font-semibold mb-1">Footfall Volume</label>
                  <input name="audience.footfall.volume" value={form.audience.footfall.volume} onChange={handleChange} className="w-full border rounded px-3 py-2" type="number" placeholder="e.g., 10000" />
              </div>
              <div>
                  <label className="block font-semibold mb-1">Footfall Period</label>
                  <select name="audience.footfall.period" value={form.audience.footfall.period} onChange={handleChange} className="w-full border rounded px-3 py-2">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                  </select>
              </div>
               <div>
                  <label className="block font-semibold mb-1">Footfall Source</label>
                  <input name="audience.footfall.source" value={form.audience.footfall.source} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g., Local Survey" />
              </div>
          </div>
          <div>
              <label className="block font-semibold mb-1">Demographics</label>
              <textarea name="audience.demographics" value={form.audience.demographics} onChange={handleChange} className="w-full border rounded px-3 py-2" rows="2" placeholder="e.g., Students, IT Professionals, Shoppers" />
               <p className="text-xs text-gray-500 mt-1">Enter comma-separated values.</p>
          </div>
           <div>
              <label className="block font-semibold mb-1">Best Suited For</label>
              <textarea name="audience.bestSuitedFor" value={form.audience.bestSuitedFor} onChange={handleChange} className="w-full border rounded px-3 py-2" rows="2" placeholder="e.g., Tech Brands, FMCG, Real Estate" />
              <p className="text-xs text-gray-500 mt-1">Enter comma-separated values.</p>
          </div>
      </div>

      <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Audience Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                  <label className="block font-semibold mb-1">Commute Patterns</label>
                  <textarea name="audience.commutePatterns" value={form.audience.commutePatterns} onChange={handleChange} className="w-full border rounded px-3 py-2" rows="2" placeholder="e.g., Office Goers, Shoppers, Tourists" />
                  <p className="text-xs text-gray-500 mt-1">Enter comma-separated values.</p>
              </div>
              <div>
                  <label className="block font-semibold mb-1">Points of Interest</label>
                  <textarea name="audience.pointsOfInterest" value={form.audience.pointsOfInterest} onChange={handleChange} className="w-full border rounded px-3 py-2" rows="2" placeholder="e.g., Malls, Metro Stations, Parks" />
                  <p className="text-xs text-gray-500 mt-1">Enter comma-separated values.</p>
              </div>
          </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map(tag => (
            <label key={tag} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={form.tags.includes(tag)}
                onChange={() => handleTagChange(tag)}
              />
              <span>{tag}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Additional Costs</h2>
        {form.pricing.additionalCosts.map((cost, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Name"
              value={cost.name}
              onChange={e => handleAdditionalCostChange(idx, 'name', e.target.value)}
              className="border rounded px-2 py-1"
            />
            <input
              type="number"
              placeholder="Cost"
              value={cost.cost}
              onChange={e => handleAdditionalCostChange(idx, 'cost', e.target.value)}
              className="border rounded px-2 py-1"
            />
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={cost.isIncluded}
                onChange={e => handleAdditionalCostChange(idx, 'isIncluded', e.target.checked)}
              />
              Included
            </label>
            <button type="button" onClick={() => removeAdditionalCost(idx)} className="text-red-500">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addAdditionalCost} className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Add Cost</button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Media</h2>
        <div>
          <label className="block font-semibold mb-1">Upload Media<span className="text-red-500">*</span></label>
          <input type="file" multiple accept="image/*,video/*,.360" onChange={handleMediaChange} className="w-full border rounded px-3 py-2" required />
          <div className="text-xs text-gray-500 mt-1">Upload up to 5 files. Max file size: 50MB.</div>
        </div>
        {mediaFiles.map((file, index) => (
          <div key={index} className="flex items-center gap-2 border-t pt-2">
              <span className="text-sm truncate">{file.name}</span>
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

      <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Legal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                  <label className="block font-semibold mb-1">Permit Status</label>
                  <select name="legal.permitStatus" value={form.legal.permitStatus} onChange={handleChange} className="w-full border rounded px-3 py-2">
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Not Required">Not Required</option>
                  </select>
              </div>
              <div>
                  <label className="block font-semibold mb-1">Permit ID</label>
                  <input name="legal.permitId" value={form.legal.permitId} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                  <label className="block font-semibold mb-1">Permit Expiry Date</label>
                  <input name="legal.permitExpiryDate" value={form.legal.permitExpiryDate} onChange={handleChange} className="w-full border rounded px-3 py-2" type="date"/>
              </div>
          </div>
      </div>

      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold mt-2 hover:bg-blue-700 disabled:bg-gray-400" disabled={loading}>
        {loading ? 'Creating...' : 'Create Hoarding'}
      </button>
    </form>
  </div>
);
}