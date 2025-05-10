'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/components/CartContext';
import Banner from '@/components/Banner'; 

export default function Home() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const categoriesRes = await fetch('/api/categories');
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
        
        
        const menuRes = await fetch('/api/menu');
        const menuData = await menuRes.json();
        setMenuItems(menuData);
        
      } catch (error) {
        console.error('Data loading error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMenu = menuItems
    .filter(item => selectedCategory === 'all' || item.category_id === parseInt(selectedCategory))
    .filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAddToCart = (item) => {
    addToCart(item);
    alert(`${item.name} sepete eklendi!`);
  };
  
  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin w-6 h-6 border-2 border-t-transparent border-orange-500 rounded-full mx-auto"></div>
        <p className="text-sm mt-2">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="py-6 container mx-auto max-w-7xl px-4">
      
      <h1 id="pagemessage" className="text-2xl font-bold text-center mb-6">Lezzetli bir şeyler mi istiyorsunuz? Sipariş verin!</h1>

      {/* Banner Component */}
      <Banner />
      
      <div className="relative w-full max-w-md mx-auto mb-6">
        <input id="search"
          type="text"
          placeholder="Ne yemek istersiniz?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-6 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-lg"
        />
      </div>
      {/* Kategori ve Arama */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`category-btn ${selectedCategory === 'all' ? 'bg-orange-500 text-white' : ''}`}
          >
            Tümü
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`category-btn ${selectedCategory === category.id ? 'bg-orange-500 text-white' : ''}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menü Grid */}
      <div className="menu-grid">
        {filteredMenu.map((item) => (
          <div key={item.id} className="card">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="card-img"
            />
            <div id="menutext" className="p-3 flex flex-col justify-between h-full">
              <div>
                <h3 className="product-name">{item.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="product-price">{item.price}₺</span>
                <button onClick={() => handleAddToCart(item)} className="text-xs px-3 py-1 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Sepete Ekle
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}