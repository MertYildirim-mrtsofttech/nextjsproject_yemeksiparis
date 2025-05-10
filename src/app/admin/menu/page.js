'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminMenuPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);


  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  
  const [categoryEditMode, setCategoryEditMode] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);

  
  const initialFormState = {
    name: '',
    description: '',
    category: '',
    price: '',
    imageUrl: '',
  };
  const [formData, setFormData] = useState(initialFormState);


  const initialCategoryForm = {
    name: '',
    description: '',
  };
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);

  
  const [activeTab, setActiveTab] = useState('menu');

  
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' || session?.user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const categoriesRes = await fetch('/api/categories');
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);

        const menuRes = await fetch('/api/menu');
        const menuData = await menuRes.json();
        setMenuItems(menuData);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, session, router]);

  
  const handleDelete = async (id) => {
    if (!confirm('Bu menü öğesini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        try {
          const data = await response.json();
          console.log('Silme işlemi yanıtı:', data);
        } catch (e) {
          console.log('Silme işlemi başarılı, ancak JSON yanıtı alınamadı');
        }
        
        setMenuItems(prev => prev.filter(item => item.id !== id));
        alert('Menü öğesi başarıyla silindi.');
      } else {
        alert('Menü öğesi silinirken bir hata oluştu. HTTP Status: ' + response.status);
      }
    } catch (error) {
      console.error('Menü silme hatası:', error);
      alert('Bir hata oluştu, lütfen tekrar deneyin.');
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const { name, description, category, price, imageUrl } = formData;

  if (!name || !category || !price || isNaN(price) || !imageUrl) {
    alert('Lütfen tüm alanları doğru şekilde doldurduğunuzdan emin olun.');
    return;
  }

  try {
    if (editMode) {
      
      const response = await fetch(`/api/menu/${editItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          category_id: category,
          price: parseFloat(price),
          imageUrl, 
        }),
      });

      if (response.ok) {
        const updatedItem = await response.json();

        const categoryName = categories.find(cat => cat.id.toString() === category.toString())?.name || 'Kategorisiz';

        const updatedItemWithCategory = {
          ...updatedItem,
          category_name: categoryName
        };

        setMenuItems(prev =>
          prev.map(item => item.id === editItemId ? updatedItemWithCategory : item)
        );

        alert('Menü öğesi başarıyla güncellendi.');
        setEditMode(false);
        setEditItemId(null);
        setFormData(initialFormState);
      } else {
        alert('Menü öğesi güncellenirken bir hata oluştu. HTTP Status: ' + response.status);
      }

    } else {
      
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          category_id: category,
          price: parseFloat(price),
          imageUrl, 
        }),
      });

      if (response.ok) {
        const newItem = await response.json();

        const categoryName = categories.find(cat => cat.id.toString() === category.toString())?.name || 'Kategorisiz';

        const newItemWithCategory = {
          ...newItem,
          category_name: categoryName
        };

        setMenuItems(prev => [...prev, newItemWithCategory]);

        alert('Yeni menü öğesi başarıyla eklendi.');
        setFormData(initialFormState);
        window.location.reload();
      } else {
        alert('Menü öğesi eklenirken bir hata oluştu. HTTP Status: ' + response.status);
      }
    }
  } catch (error) {
    console.error(editMode ? 'Menü güncelleme hatası:' : 'Menü ekleme hatası:', error);
    alert('Bir hata oluştu, lütfen tekrar deneyin.');
  }
};

 const handleEdit = (item) => {
  setEditMode(true);
  setEditItemId(item.id);
  setFormData({
    name: item.name,
    description: item.description || '',
    category: item.category_id?.toString() || '',
    price: item.price?.toString() || '',
    imageUrl: item.imageUrl || '', 
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
};


  const handleCancelEdit = () => {
    setEditMode(false);
    setEditItemId(null);
    setFormData(initialFormState);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    const { name, description } = categoryForm;
    
    
    if (!name) {
      alert('Kategori adı zorunludur.');
      return;
    }
    
    try {
      if (categoryEditMode) {
        
        const response = await fetch(`/api/categories/${editCategoryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            description,
          }),
        });
        
        if (response.ok) {
          let updatedCategory;
          try {
            updatedCategory = await response.json();
          } catch (e) {
            console.log('Kategori güncelleme başarılı, ancak JSON yanıtı alınamadı');
            updatedCategory = {
              id: editCategoryId,
              name,
              description
            };
          }
          
          setCategories(prev => 
            prev.map(cat => cat.id === editCategoryId ? updatedCategory : cat)
          );
          
          
          setMenuItems(prev => prev.map(item => 
            item.category_id === editCategoryId 
              ? { ...item, category_name: name } 
              : item
          ));
          
          alert('Kategori başarıyla güncellendi.');
          setCategoryEditMode(false);
          setEditCategoryId(null);
          setCategoryForm(initialCategoryForm);
        } else {
          alert('Kategori güncellenirken bir hata oluştu. HTTP Status: ' + response.status);
        }
      } else {
        
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            description,
          }),
        });
        
        if (response.ok) {
          let newCategory;
          try {
            newCategory = await response.json();
          } catch (e) {
            console.log('Kategori ekleme başarılı, ancak JSON yanıtı alınamadı');
            newCategory = {
              id: Date.now(),
              name,
              description
            };
          }
          
          setCategories(prev => [...prev, newCategory]);
          alert('Yeni kategori başarıyla eklendi.');
          setCategoryForm(initialCategoryForm);
        } else {
          alert('Kategori eklenirken bir hata oluştu. HTTP Status: ' + response.status);
        }
      }
    } catch (error) {
      console.error(categoryEditMode ? 'Kategori güncelleme hatası:' : 'Kategori ekleme hatası:', error);
      alert('Bir hata oluştu, lütfen tekrar deneyin.');
    }
  };
  
  const handleCategoryEdit = (category) => {
    setCategoryEditMode(true);
    setEditCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
    });
    
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCategoryCancelEdit = () => {
    setCategoryEditMode(false);
    setEditCategoryId(null);
    setCategoryForm(initialCategoryForm);
  };
  
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm({
      ...categoryForm,
      [name]: value,
    });
  };
  
  const handleCategoryDelete = async (id) => {
    
    const itemsInCategory = menuItems.filter(item => item.category_id === id);
    
    if (itemsInCategory.length > 0) {
      const shouldProceed = confirm(
        `Bu kategoride ${itemsInCategory.length} adet menü öğesi bulunuyor. Kategoriyi silmek bu öğelerin kategorisini boş yapacaktır. Devam etmek istiyor musunuz?`
      );
      
      if (!shouldProceed) return;
    } else {
      if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
        return;
      }
    }
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
        
        
        setMenuItems(prev => prev.map(item => 
          item.category_id === id 
            ? { ...item, category_id: null, category_name: 'Kategorisiz' } 
            : item
        ));
        
        alert('Kategori başarıyla silindi.');
      } else {
        alert('Kategori silinirken bir hata oluştu. HTTP Status: ' + response.status);
      }
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      alert('Bir hata oluştu, lütfen tekrar deneyin.');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Yükleniyor...</div>;
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Menü Yönetimi</h1>
      
      {/* Sekmeler */}
      <div className="flex mb-6 border-b">
        <button 
          className={`px-4 py-2 ${activeTab === 'menu' 
            ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
            : 'text-gray-600'}`}
          onClick={() => setActiveTab('menu')}
        >
          Menü Öğeleri
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'categories' 
            ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
            : 'text-gray-600'}`}
          onClick={() => setActiveTab('categories')}
        >
          Kategoriler
        </button>
      </div>
      
      {activeTab === 'menu' ? (
        <>
          {/* Menü Ekleme/Düzenleme Formu */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editMode ? 'Menü Öğesini Düzenle' : 'Yeni Menü Öğesi Ekle'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Menü Adı
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Açıklama
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border rounded-md"
                    rows="3"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Kategori
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border rounded-md"
                    required
                  >
                    <option value="">Bir kategori seçin</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Fiyat (TL)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                    Görsel URL
                  </label>
                  <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border rounded-md"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  {editMode && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-md"
                    >
                      İptal
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`mt-4 px-6 py-2 ${editMode ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-md`}
                  >
                    {editMode ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Menü Listesi */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold p-4 border-b">Mevcut Menü Öğeleri</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görsel</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {menuItems.length > 0 ? (
                    menuItems.map((item) => {
                      const price = parseFloat(item.price);
                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4">{item.name}</td>
                          <td className="px-6 py-4">{item.description || '-'}</td>
                          <td className="px-6 py-4">{item.category_name || 'Kategorisiz'}</td>
                          <td className="px-6 py-4">{!isNaN(price) ? price.toFixed(2) : 'Geçersiz Fiyat'} TL</td>
                          <td className="px-6 py-4">
                            {item.imageUrl ? (
                              <div className="w-20 h-20 overflow-hidden rounded-md">
                                <img 
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="object-cover w-full h-full"
                                  style={{
                                    width: '100px',
                                    height: '100px',
                                    objectFit: 'cover'
                                  }}
                                />
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Görsel Yok</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button id="dltbtn"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-500 hover:text-red-700 mr-2"
                            >
                              Sil
                            </button>
                            <button id="rgbtn"
                              onClick={() => handleEdit(item)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Düzenle
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        Henüz menü öğesi eklenmemiş.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Kategori Ekleme/Düzenleme Formu */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {categoryEditMode ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
            </h2>
            <form onSubmit={handleCategorySubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                    Kategori Adı
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleCategoryInputChange}
                    className="mt-1 block w-full px-4 py-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700">
                    Açıklama
                  </label>
                  <textarea
                    id="categoryDescription"
                    name="description"
                    value={categoryForm.description}
                    onChange={handleCategoryInputChange}
                    className="mt-1 block w-full px-4 py-2 border rounded-md"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  {categoryEditMode && (
                    <button
                      type="button"
                      onClick={handleCategoryCancelEdit}
                      className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-md"
                    >
                      İptal
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`mt-4 px-6 py-2 ${categoryEditMode ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-md`}
                  >
                    {categoryEditMode ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Kategori Listesi */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold p-4 border-b">Mevcut Kategoriler</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İlişkili Menü Öğeleri</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.length > 0 ? (
                    categories.map((category) => {
                      const itemCount = menuItems.filter(item => item.category_id === category.id).length;
                      return (
                        <tr key={category.id}>
                          <td className="px-6 py-4">{category.name}</td>
                          <td className="px-6 py-4">{category.description || '-'}</td>
                          <td className="px-6 py-4">{itemCount}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleCategoryDelete(category.id)}
                              className="text-red-500 hover:text-red-700 mr-2"
                            >
                              Sil
                            </button>
                            <button
                              onClick={() => handleCategoryEdit(category)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Düzenle
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        Henüz kategori eklenmemiş.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}