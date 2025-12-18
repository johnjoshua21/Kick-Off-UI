import React, { useState } from 'react';
import { MapPin, Clock, DollarSign, Phone, ChevronLeft, ChevronRight } from 'lucide-react';

const TurfCard = ({ turf, onBookNow }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get images from turf data
  const images = turf.imageUrls || [];
  const hasImages = images.length > 0;
  
  // Construct full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it starts with /api/files, construct the full URL
    if (imageUrl.startsWith('/api')) {
      return `http://localhost:8080${imageUrl}`;
    }
    
    // Otherwise, assume it's just the filename
    return `http://localhost:8080/api/files/${imageUrl}`;
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500">
        {hasImages ? (
          <>
            <img
              src={getImageUrl(images[currentImageIndex])}
              alt={`${turf.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to gradient if image fails to load
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
              }}
            />
            
            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image Dots Indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-white w-4'
                        : 'bg-white bg-opacity-50'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          // Fallback gradient with icon
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-4xl font-bold mb-2">🏟️</div>
              <p className="text-lg font-semibold">{turf.type}</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{turf.name}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span>{turf.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              {turf.operatingStartTime} - {turf.operatingEndTime}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            <span>{turf.phone}</span>
          </div>
        </div>

        {turf.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {turf.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {turf.pricePerSlot}
            </span>
            <span className="text-sm text-gray-500 ml-1">/hour</span>
          </div>
          
          <button
            onClick={() => onBookNow(turf)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TurfCard;