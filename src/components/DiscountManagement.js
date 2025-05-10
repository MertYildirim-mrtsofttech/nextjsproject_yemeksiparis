'use client';
import { useEffect, useState } from 'react';

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    amount: '',
    isPercent: true,
    minOrderAmount: '',
    maxUses: '',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [editingCode, setEditingCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchDiscounts();
    fetchMenuItems();
  }, []);

  const fetchDiscounts = async () => {
    const res = await fetch('/api/discount');
    const data = await res.json();
    setDiscounts(data);
  };

  const fetchMenuItems = async () => {
    const res = await fetch('/api/menu');
    const data = await res.json();
    setMenuItems(data);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCheckboxChange = (id) => {
    setSelectedMenuItemIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedMenuItemIds(menuItems.map(item => item.id));
    } else {
      setSelectedMenuItemIds([]);
    }
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allSelected = filteredItems.length > 0 &&
    filteredItems.every(item => selectedMenuItemIds.includes(item.id));

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      amount: '',
      isPercent: true,
      minOrderAmount: '',
      maxUses: '',
      startDate: '',
      endDate: '',
      isActive: true
    });
    setSelectedMenuItemIds([]);
    setEditingCode(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingCode ? 'PUT' : 'POST';
    const body = {
      ...formData,
      amount: parseFloat(formData.amount),
      minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      startDate: formData.startDate,
      endDate: formData.endDate,
      menuItemIds: selectedMenuItemIds
    };

    if (editingCode) body.id = editingCode;

    const res = await fetch('/api/discount', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      fetchDiscounts();
      resetForm();
    } else {
      alert('İndirim kodu kaydedilemedi.');
    }
  };

  const handleEdit = (discountCode) => {
    const formatDate = (dateString) => new Date(dateString).toISOString().slice(0, 10);

    setFormData({
      code: discountCode.code,
      description: discountCode.description || '',
      amount: discountCode.amount,
      isPercent: discountCode.isPercent,
      minOrderAmount: discountCode.minOrderAmount || '',
      maxUses: discountCode.maxUses || '',
      startDate: formatDate(discountCode.startDate),
      endDate: formatDate(discountCode.endDate),
      isActive: discountCode.isActive
    });

    const relatedIds = (discountCode.discountMenuItems || []).map(dmi => dmi.menuItemId);
    setSelectedMenuItemIds(relatedIds);
    setEditingCode(discountCode.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/discount?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchDiscounts();
    else alert('Silinemedi');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">İndirim Kodları</h1>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          Yeni İndirim Kodu Ekle
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6 mb-6">

          <div>
            <label className="block mb-1">İndirim Kodu</label>
            <input type="text" name="code" value={formData.code} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block mb-1">Açıklama</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">İndirim Tutarı</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" name="isPercent" checked={formData.isPercent} onChange={handleChange} className="mr-2" />
              <label>Yüzde mi?</label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Minimum Sipariş Tutarı</label>
              <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block mb-1">Maksimum Kullanım</label>
              <input type="number" name="maxUses" value={formData.maxUses} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Başlangıç Tarihi</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block mb-1">Bitiş Tarihi</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="block mb-1">Ürün Seçimi</label>
            <input type="text" placeholder="Ürün ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mb-2 px-3 py-2 border rounded-md w-full" />

            <label className="flex items-center space-x-2 mb-2">
              <input type="checkbox" checked={allSelected} onChange={handleSelectAll} />
              <span>Tümünü Seç</span>
            </label>

            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredItems.map(item => (
                <label key={item.id} className="flex items-center space-x-2">
                  <input type="checkbox" checked={selectedMenuItemIds.includes(item.id)} onChange={() => handleCheckboxChange(item.id)} />
                  <span>{item.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              {editingCode ? "Güncelle" : "Oluştur"}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded">
              İptal
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-4">
        {discounts.map((d) => (
          <li key={d.id}>
            <div>
              <p className="font-semibold">{d.code}</p>
              <p>{d.description}</p>
              <p>{d.amount}{d.isPercent ? '%' : '₺'} / Aktif: {d.isActive ? 'Evet' : 'Hayır'}</p>
              <p>Ürünler: {d.discountMenuItems?.map(dm => dm.menuItem?.name).join(', ') || 'Hepsi'}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEdit(d)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                  Düzenle
                </button>
                <button onClick={() => handleDelete(d.id)} className="bg-red-600 text-white px-3 py-1 rounded">
                  Sil
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
