'use client';
import { useState, useEffect } from 'react';

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [currentBanner, setCurrentBanner] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    order: 0
  });

  
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/banners');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Banner\'lar yüklenirken hata oluştu');
      
      setBanners(data);
      setError(null);
    } catch (err) {
      console.error('Banner yükleme hatası:', err);
      setError('Banner\'lar yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              name === 'order' ? parseInt(value) : value
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      isActive: true,
      order: 0
    });
    setFormMode('add');
    setCurrentBanner(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      
      if (!formData.title || !formData.imageUrl) {
        setError('Başlık ve görsel URL alanları zorunludur.');
        setLoading(false);
        return;
      }

      let response;
      
      if (formMode === 'add') {
        
        response = await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        
        response = await fetch(`/api/banners/${currentBanner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'İşlem sırasında hata oluştu');
      
      
      await fetchBanners();
      resetForm();
      setError(null);
      
    } catch (err) {
      console.error('Banner işlem hatası:', err);
      setError('İşlem sırasında hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner) => {
    setFormMode('edit');
    setCurrentBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      isActive: banner.isActive,
      order: banner.order
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu banner\'ı silmek istediğinizden emin misiniz?')) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/banners/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Banner silinirken hata oluştu');
      
      
      await fetchBanners();
      setError(null);
      
    } catch (err) {
      console.error('Banner silme hatası:', err);
      setError('Banner silinirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {formMode === 'add' ? 'Yeni Banner Ekle' : 'Banner Düzenle'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Başlık*
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                Görsel URL*
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="linkUrl">
                Bağlantı URL
              </label>
              <input
                id="linkUrl"
                name="linkUrl"
                type="url"
                value={formData.linkUrl}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="order">
                Sıra
              </label>
              <input
                id="order"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                min="0"
              />
            </div>
            
            <div className="mb-4 flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-gray-700 text-sm font-bold" htmlFor="isActive">
                Aktif
              </label>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'İşleniyor...' : formMode === 'add' ? 'Banner Ekle' : 'Güncelle'}
            </button>
            
            {formMode === 'edit' && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                İptal
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Banner Listesi</h2>
        
        {loading && !banners.length ? (
          <div className="flex justify-center items-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : !banners.length ? (
          <p className="text-gray-500 text-center py-6">Henüz banner eklenmemiş.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başlık
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Görsel
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sıra
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                          {banner.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {banner.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td id="bannerimgadmin" className="py-2 px-4 border-b border-gray-200">
                      <div className="w-16 h-12 overflow-hidden rounded">
                        <img 
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          banner.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {banner.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                      {banner.order}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}