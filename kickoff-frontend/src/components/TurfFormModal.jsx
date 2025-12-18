import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Upload, Trash2, Image } from 'lucide-react';
import { turfService } from '../services/turfService';
import { useAuth } from '../context/AuthContext';
import api from '../services/authService';

const TurfFormModal = ({ turf, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    type: 'FOOTBALL',
    pricePerSlot: '',
    description: '',
    operatingStartTime: '06:00',
    operatingEndTime: '22:00'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const sportTypes = [
    'FOOTBALL', 'CRICKET', 'BADMINTON', 'TENNIS',
    'BASKETBALL', 'VOLLEYBALL', 'HOCKEY', 'FUTSAL'
  ];

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  useEffect(() => {
    if (turf) {
      setFormData({
        name: turf.name || '',
        phone: turf.phone || '',
        location: turf.location || '',
        type: turf.type || 'FOOTBALL',
        pricePerSlot: turf.pricePerSlot || '',
        description: turf.description || '',
        operatingStartTime: turf.operatingStartTime || '06:00',
        operatingEndTime: turf.operatingEndTime || '22:00'
      });
      
      if (turf.imageUrls && turf.imageUrls.length > 0) {
        setExistingImages(turf.imageUrls);
      }
    }
  }, [turf]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        setError(`${file.name} is not a valid image file`);
      }
      return isValid;
    });

    const oversizedFiles = validFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed 10MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setImageFiles(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) {
      return [];
    }

    setUploadingImages(true);
    const formDataUpload = new FormData();
    
    // CRITICAL FIX: Append each file with the correct parameter name
    imageFiles.forEach(file => {
      formDataUpload.append('files', file);
    });

    // Log for debugging
    console.log('Uploading', imageFiles.length, 'files');

    try {
      // CRITICAL FIX: Don't set Content-Type header - let browser set it with boundary
      const response = await api.post('/files/upload-multiple', formDataUpload);

      console.log('Upload response:', response.data);
      return response.data.files.map(file => file.fileUrl);
    } catch (err) {
      console.error('Upload error:', err);
      console.error('Error response:', err.response?.data);
      throw new Error('Failed to upload images: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingImages(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Turf name is required');
      return false;
    }
    if (formData.phone.length < 10) {
      setError('Phone number must be at least 10 digits');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    if (!formData.pricePerSlot || parseFloat(formData.pricePerSlot) <= 0) {
      setError('Valid price is required');
      return false;
    }
    if (formData.operatingStartTime >= formData.operatingEndTime) {
      setError('End time must be after start time');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Upload new images first
      const newImageUrls = await uploadImages();
      const allImageUrls = [...existingImages, ...newImageUrls];

      const turfData = {
        ...formData,
        ownerId: user.userId,
        imageUrls: allImageUrls
      };

      if (turf) {
        await turfService.updateTurf(turf.id, { ...formData, imageUrls: allImageUrls });
        alert('Turf updated successfully!');
      } else {
        await turfService.createTurf(turfData);
        alert('Turf created successfully!');
      }
      
      onSuccess();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to save turf. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/api')) {
      return `http://localhost:8080${imageUrl}`;
    }
    
    return `http://localhost:8080/api/files/${imageUrl}`;
  };

  const totalImages = existingImages.length + imageFiles.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {turf ? 'Edit Turf' : 'Add New Turf'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              <Image className="inline w-4 h-4 mr-1" />
              Turf Images (Optional)
            </label>
            
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                <Upload className="w-5 h-5 mr-2 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Click to upload images
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={loading || uploadingImages}
                />
              </label>
              <span className="text-xs text-gray-500">
                {totalImages} image{totalImages !== 1 ? 's' : ''}
              </span>
            </div>

            {(existingImages.length > 0 || imagePreviewUrls.length > 0) && (
              <div className="grid grid-cols-4 gap-3">
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={getImageUrl(url)}
                      alt={`Existing ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={loading}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}

                {imagePreviewUrls.map((url, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={loading}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                      New
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              Max 10MB per image. First image will be used as primary.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Turf Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Champions Ground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Coimbatore, Tamil Nadu"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sport Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sportTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Hour (₹) *
              </label>
              <input
                type="number"
                name="pricePerSlot"
                value={formData.pricePerSlot}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Time *
              </label>
              <input
                type="time"
                name="operatingStartTime"
                value={formData.operatingStartTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closing Time *
              </label>
              <input
                type="time"
                name="operatingEndTime"
                value={formData.operatingEndTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any additional details about your turf..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading || uploadingImages}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || uploadingImages}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || uploadingImages 
                ? (uploadingImages ? 'Uploading Images...' : 'Saving...') 
                : turf ? 'Update Turf' : 'Create Turf'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurfFormModal;