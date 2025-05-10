'use client';
import { useState, useEffect } from 'react';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners');
        if (!response.ok) {
          throw new Error('Failed to fetch banners');
        }
        const data = await response.json();
        setBanners(data);
      } catch (err) {
        console.error('Error fetching banners:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  
  useEffect(() => {
    if (banners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  if (loading) {
    return (
      <div className="w-full bg-gray-100 animate-pulse h-56 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Kampanyalar yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-50 p-4 rounded-lg">
        <p className="text-red-500">Error loading banners: {error}</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Don't show anything if no banners
  }

  const currentBanner = banners[currentBannerIndex];
  
  
  const BannerContent = () => (
    <div id="banner" className="relative w-full h-56 overflow-hidden rounded-lg">
      <img id="bannerimg"
        src={currentBanner.imageUrl} 
        alt={currentBanner.title} 
        //className="w-full h-full object-cover"
      />
      {currentBanner.title && (
          <h2 className="text-xl font-bold text-white mb-2">{currentBanner.title}</h2>
        )}
        {currentBanner.description && (
          <p className="text-white text-sm">{currentBanner.description}</p>
        )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
        
      </div>
    </div>
  );

  return (
    <div className="w-full mb-6 transition-opacity duration-300 ease-in-out">
      {currentBanner.linkUrl ? (
        <a href={currentBanner.linkUrl} className="block">
          <BannerContent />
        </a>
      ) : (
        <BannerContent />
      )}
      
      {/* Banner indicators */}
      {banners.length > 1 && (
        <div className="flex justify-center mt-2 gap-1">
          {banners.map((_, index) => (
            <div 
              key={index} 
              className={`h-1.5 rounded-full ${
                index === currentBannerIndex ? 'w-6 bg-orange-500' : 'w-2 bg-gray-300'
              } transition-all duration-300`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Banner;