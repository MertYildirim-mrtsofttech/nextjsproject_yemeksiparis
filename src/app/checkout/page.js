'use client';

import { useCart } from '@/components/CartContext';
import { useState } from 'react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, getTotalAmount } = useCart();
  const [loading, setLoading] = useState(false);
  const [userInfoLoading, setUserInfoLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountResult, setDiscountResult] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');

  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    note: ''
  });

  const fetchUserInfo = async () => {
    setUserInfoLoading(true);
    try {
      const response = await fetch('/api/user/info', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Kullanıcı bilgileri alınamadı');
      }

      const data = await response.json();

      setCustomerInfo({
        firstName: data.user.first_name || '',
        lastName: data.user.last_name || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        address: data.user.address || '',
        note: customerInfo.note
      });
    } catch (error) {
      console.error('Kullanıcı bilgileri çekme hatası:', error);
      alert('Kullanıcı bilgileri alınamadı. Lütfen giriş yaptığınızdan emin olun.');
    } finally {
      setUserInfoLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const applyDiscount = async () => {
    setDiscountLoading(true);
    setDiscountError('');
    try {
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode,
          cartItems: cart,
          cartTotal: getTotalAmount()
        })
      });

      const data = await response.json();
      if (!data.valid) {
        setDiscountResult(null);
        setDiscountError(data.message || 'Geçersiz indirim kodu');
      } else {
        setDiscountResult(data);
      }
    } catch (err) {
      console.error(err);
      setDiscountError('Bir hata oluştu');
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo,
          cartItems: cart,
          discount: discountResult
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Stripe yönlendirmesi başarısız.');
      }
    } catch (error) {
      console.error('Checkout başlatma hatası:', error);
      alert('Ödeme başlatılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const displayCartItems = discountResult?.discountedItems || cart;

  const getFinalTotal = () => {
    if (discountResult?.discountedItems) {
      return discountResult.discountedItems.reduce((sum, item) => {
        const price = item.discounted ? item.discountedPrice : item.price;
        return sum + price * item.quantity;
      }, 0);
    }
    return getTotalAmount();
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Sipariş</h1>
        <p className="text-gray-500 mb-4">Sepetiniz boş.</p>
        <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Alışverişe Devam Et
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Sipariş Bilgileri</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Teslimat Bilgileri</h2>
              <button
                type="button"
                onClick={fetchUserInfo}
                disabled={userInfoLoading}
                className={`bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm rounded ${userInfoLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {userInfoLoading ? 'Yükleniyor...' : 'Kendi Bilgilerimi Kullan'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium">Ad</label>
                <input type="text" name="firstName" value={customerInfo.firstName} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium">Soyad</label>
                <input type="text" name="lastName" value={customerInfo.lastName} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">E-posta</label>
              <input type="email" name="email" value={customerInfo.email} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Telefon</label>
              <input type="tel" name="phone" value={customerInfo.phone} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium">Adres</label>
              <textarea name="address" value={customerInfo.address} onChange={handleChange} required rows="3" className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium">Müşteri Notu</label>
              <textarea name="note" value={customerInfo.note} onChange={handleChange} rows="3" className="w-full px-3 py-2 border rounded-md" placeholder="Varsa teslimat notunuzu yazın." />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">İndirim Kodu</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="KODU GİRİN"
                />
                <button
                  onClick={applyDiscount}
                  type="button"
                  disabled={discountLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {discountLoading ? 'Kontrol...' : 'Uygula'}
                </button>
              </div>
              {discountError && <p className="text-red-500 text-sm mt-1">{discountError}</p>}
              {discountResult && (
                <div className="text-green-600 text-sm mt-2">
                  Kod uygulandı: {discountResult.discountAmount.toFixed(2)} TL indirim
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className={`w-full bg-green-500 text-white py-2 rounded-md ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-600'}`}>
              {loading ? 'Stripe\'a yönlendiriliyor...' : 'Ödemeye Geç'}
            </button>
          </form>
        </div>

        {/* Sipariş Özeti */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sipariş Özeti</h2>
          <div className="border-b pb-4 mb-4">
            {displayCartItems.map((item) => (
              <div key={item.id} className="flex justify-between mb-2">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500 ml-2">x {item.quantity}</span>
                </div>
                <div className="text-right">
                  {item.discounted ? (
                    <>
                      <div className="text-gray-400 line-through text-sm">
                        {(item.originalPrice * item.quantity).toFixed(2)} TL
                      </div>
                      <div className="text-green-600 font-bold">
                        {(item.discountedPrice * item.quantity).toFixed(2)} TL
                      </div>
                    </>
                  ) : (
                    <span>{(item.price * item.quantity).toFixed(2)} TL</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-xl font-semibold">
            <span>Toplam:</span>
            <span>
              {discountResult ? (
                <div className="flex flex-col items-end">
                  <span className="text-gray-500 line-through text-sm">{getTotalAmount().toFixed(2)} TL</span>
                  <span className="text-green-600 font-bold text-xl">{discountResult.newTotal.toFixed(2)} TL (İndirimli)</span>
                </div>
              ) : (
                <span>{getTotalAmount().toFixed(2)} TL</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
