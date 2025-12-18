// src/pages/owner/MyTurfs.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { turfService } from '../../services/turfService';
import { Plus, Edit, Trash2, MapPin, Clock, DollarSign, Phone, Building2 } from 'lucide-react';
import TurfFormModal from '../../components/TurfFormModal';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const MyTurfs = () => {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTurf, setSelectedTurf] = useState(null);

  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    try {
      setLoading(true);
      const data = await turfService.getTurfsByOwnerId(user.userId);
      setTurfs(data);
    } catch (error) {
      console.error('Error fetching turfs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTurf = () => {
    setSelectedTurf(null);
    setShowModal(true);
  };

  const handleEditTurf = (turf) => {
    setSelectedTurf(turf);
    setShowModal(true);
  };

  const handleDeleteTurf = async (turfId) => {
    if (!confirm('Are you sure you want to delete this turf? This action cannot be undone.')) {
      return;
    }

    try {
      await turfService.deleteTurf(turfId);
      alert('Turf deleted successfully');
      fetchTurfs();
    } catch (error) {
      alert('Failed to delete turf. It may have existing bookings.');
      console.error('Error deleting turf:', error);
    }
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setSelectedTurf(null);
    fetchTurfs();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading turfs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Turfs</h1>
          <p className="mt-2 text-gray-600">Manage your turf facilities</p>
        </div>
        <button
          onClick={handleAddTurf}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Turf
        </button>
      </div>

      {/* Turfs Grid */}
      {turfs.length === 0 ? (
        <div className="bg-white p-12 rounded-lg text-center border border-gray-200">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No turfs yet. Add your first turf to get started!</p>
          <button
            onClick={handleAddTurf}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Turf
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turfs.map((turf) => (
            <TurfCard
              key={turf.id}
              turf={turf}
              onEdit={handleEditTurf}
              onDelete={handleDeleteTurf}
            />
          ))}
        </div>
      )}

      {/* Turf Form Modal */}
      {showModal && (
        <TurfFormModal
          turf={selectedTurf}
          onClose={() => {
            setShowModal(false);
            setSelectedTurf(null);
          }}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

const TurfCard = ({ turf, onEdit, onDelete }) => {
  const imageUrl = turf.primaryImageUrl || (turf.imageUrls && turf.imageUrls[0]);
   const fullImageUrl = imageUrl ? `${BASE_URL}${imageUrl}` : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Image */}
      {fullImageUrl ? (
        <div className="h-48 overflow-hidden">
          <img
            src={fullImageUrl}
            alt={turf.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.parentElement.innerHTML = `
                <div class="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <div class="text-white text-center">
                    <div class="text-4xl font-bold mb-2">🏟️</div>
                    <p class="text-lg font-semibold">${turf.type}</p>
                  </div>
                </div>
              `;
            }}
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl font-bold mb-2">🏟️</div>
            <p className="text-lg font-semibold">{turf.type}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{turf.name}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span>{turf.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>{turf.operatingStartTime} - {turf.operatingEndTime}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            <span>{turf.phone}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-semibold">₹{turf.pricePerSlot}/hour</span>
          </div>
        </div>

        {turf.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {turf.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-4 pt-4 border-t border-gray-200 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{turf.totalBookings || 0}</p>
            <p className="text-xs text-gray-500">Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{turf.totalBlockedSlots || 0}</p>
            <p className="text-xs text-gray-500">Blocked</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(turf)}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => onDelete(turf.id)}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyTurfs;