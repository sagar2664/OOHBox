import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getHoardingById, updateHoarding } from '../api/api';
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

export default function EditHoarding() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaCaptions, setMediaCaptions] = useState({});
  const [deleteMediaKeys, setDeleteMediaKeys] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getHoardingById(id)
      .then(data => {
        console.log('Fetched hoarding data:', data);
        if (!data || typeof data !== 'object' || !data._id) {
          setError('Invalid or missing hoarding data.');
          setLoading(false);
          return;
        }
        setForm({
          name: data.name || '',
          description: data.description || '',
          mediaType: data.mediaType || 'Static Billboard',
          specs: {
            width: data.specs?.width ?? '',
            height: data.specs?.height ?? '',
            units: data.specs?.units ?? 'ft',
            aspectRatio: data.specs?.aspectRatio ?? '',
            orientation: data.specs?.orientation ?? '',
            illumination: data.specs?.illumination ?? 'Non-Illuminated'
          },
          digitalSpecs: {
            resolution: data.digitalSpecs?.resolution ?? '',
            pixelDimensions: {
              width: data.digitalSpecs?.pixelDimensions?.width ?? '',
              height: data.digitalSpecs?.pixelDimensions?.height ?? ''
            }
          },
          pricing: {
            basePrice: data.pricing?.basePrice ?? '',
            per: data.pricing?.per ?? 'month',
            model: data.pricing?.model ?? 'Flat Rate',
            negotiable: data.pricing?.negotiable ?? false,
            additionalCosts: data.pricing?.additionalCosts ?? []
          },
          location: {
            address: data.location?.address ?? '',
            landmark: data.location?.landmark ?? '',
            area: data.location?.area ?? '',
            city: data.location?.city ?? '',
            state: data.location?.state ?? '',
            coordinates: data.location?.coordinates?.type === 'Point' && Array.isArray(data.location?.coordinates?.coordinates)
              ? { type: 'Point', coordinates: data.location.coordinates.coordinates }
              : { type: 'Point', coordinates: [0, 0] },
          },
          audience: {
            footfall: {
              volume: data.audience?.footfall?.volume ?? '',
              period: data.audience?.footfall?.period ?? 'daily',
              source: data.audience?.footfall?.source ?? ''
            },
            demographics: Array.isArray(data.audience?.demographics) ? data.audience.demographics.join(', ') : '',
            commutePatterns: Array.isArray(data.audience?.commutePatterns) ? data.audience.commutePatterns.join(', ') : '',
            bestSuitedFor: Array.isArray(data.audience?.bestSuitedFor) ? data.audience.bestSuitedFor.join(', ') : '',
            pointsOfInterest: Array.isArray(data.audience?.pointsOfInterest) ? data.audience.pointsOfInterest.join(', ') : '',
          },
          installation: {
            leadTimeDays: data.installation?.leadTimeDays ?? '',
            accessNotes: data.installation?.accessNotes ?? ''
          },
          legal: {
            permitStatus: data.legal?.permitStatus ?? 'Pending',
            permitId: data.legal?.permitId ?? '',
            permitExpiryDate: data.legal?.permitExpiryDate ?? ''
          },
          media: Array.isArray(data.media) ? data.media : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
        });
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load hoarding: ' + (err?.message || 'Unknown error'));
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (!form) return;

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

  const handleDeleteMedia = (mediaKey) => {
    setDeleteMediaKeys(prev => [...prev, mediaKey]);
    setForm(f => ({
      ...f,
      media: f.media.filter(m => m.key !== mediaKey)
    }));
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
    setSubmitting(true);
    setError(null);

    // Prepare the form data as a plain object (not FormData)
    const processedForm = {
      ...form,
      // Ensure location has the correct structure expected by backend
      location: {
        address: form.location?.address || '',
        landmark: form.location?.landmark || '',
        area: form.location?.area || '',
        city: form.location?.city || '',
        state: form.location?.state || '',
        coordinates: {
          type: 'Point',
          coordinates: form.location?.coordinates?.coordinates || [0, 0]
        }
      },
      // Process audience arrays from comma-separated strings back to arrays
      audience: {
        ...form.audience,
        demographics: form.audience?.demographics ? form.audience.demographics.split(',').map(s => s.trim()).filter(s => s) : [],
        commutePatterns: form.audience?.commutePatterns ? form.audience.commutePatterns.split(',').map(s => s.trim()).filter(s => s) : [],
        bestSuitedFor: form.audience?.bestSuitedFor ? form.audience.bestSuitedFor.split(',').map(s => s.trim()).filter(s => s) : [],
        pointsOfInterest: form.audience?.pointsOfInterest ? form.audience.pointsOfInterest.split(',').map(s => s.trim()).filter(s => s) : [],
      },
      // Ensure specs are numbers
      specs: {
        ...form.specs,
        width: Number(form.specs?.width) || 0,
        height: Number(form.specs?.height) || 0,
      },
      // Ensure pricing is a number
      pricing: {
        ...form.pricing,
        basePrice: Number(form.pricing?.basePrice) || 0,
      },
    };

    try {
      await updateHoarding(id, processedForm, mediaFiles, token); // Pass plain object and array
      navigate(`/hoardings/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update hoarding');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocationChange = (coords) => {
    setForm(prevForm => ({
      ...prevForm,
      location: {
        ...prevForm.location,
        coordinates: coords
          ? { type: 'Point', coordinates: [coords.lng, coords.lat] }
          : { type: 'Point', coordinates: [0, 0] },
      },
    }));
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!form) return <div className="text-center py-8 text-red-600">Form data is missing or invalid.</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-sm text-gray-500 mb-2">Home / Edit Hoarding</div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">Edit Hoarding <span className="text-blue-600">✎</span></h1>
      
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

        {/* Digital Specifications (if DOOH) */}
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

        {/* Pricing */}
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

        {/* Location */}
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
                form.location.coordinates.coordinates.length === 2 &&
                typeof form.location.coordinates.coordinates[0] === 'number' &&
                typeof form.location.coordinates.coordinates[1] === 'number'
                  ? { lat: form.location.coordinates.coordinates[1], lng: form.location.coordinates.coordinates[0] }
                  : null
              }
              onChange={coords => handleLocationChange(coords)}
            />
          </div>
        </div>

        {/* Media */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Media</h2>
          {/* Existing Media */}
          {form.media.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {form.media.map((media, index) => (
                <div key={media.key} className="relative group">
                  {media.mediaType === 'image' ? (
                    <img src={media.url} alt={media.caption || 'Hoarding media'} className="w-full h-32 object-cover rounded" />
                  ) : media.mediaType === 'video' ? (
                    <video src={media.url} className="w-full h-32 object-cover rounded" controls />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-gray-500">360° View</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(media.key)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  {media.caption && (
                    <div className="text-sm text-gray-600 mt-1">{media.caption}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* New Media Upload */}
          <div>
            <label className="block font-semibold mb-1">Add New Media</label>
            <input type="file" multiple accept="image/*,video/*,.360" onChange={handleMediaChange} className="w-full border rounded px-3 py-2" />
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

        {/* Tags */}
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

        {/* Audience commutePatterns and pointsOfInterest */}
        <div className="space-y-4">
          <label className="block font-semibold mb-1">Commute Patterns</label>
          <textarea
            name="audience.commutePatterns"
            value={form.audience.commutePatterns}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={2}
            placeholder="e.g., Office Goers, Shoppers, Tourists"
          />
          <p className="text-xs text-gray-500 mt-1">Enter comma-separated values.</p>
          <label className="block font-semibold mb-1">Points of Interest</label>
          <textarea
            name="audience.pointsOfInterest"
            value={form.audience.pointsOfInterest}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={2}
            placeholder="e.g., Malls, Metro Stations, Parks"
          />
          <p className="text-xs text-gray-500 mt-1">Enter comma-separated values.</p>
        </div>

        {/* Additional Costs */}
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

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold mt-2" disabled={submitting}>
          {submitting ? 'Updating...' : 'Update Hoarding'}
        </button>
      </form>
    </div>
  );
} 