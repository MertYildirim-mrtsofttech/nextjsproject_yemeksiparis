// app/userinfo/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UserInfo() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  useEffect(() => {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (status === 'unauthenticated') {
      router.push('/userlogin');
    }
    
    // Kullanıcı oturumu varsa en güncel verileri al
    if (status === 'authenticated' && session?.user) {
      const fetchUserData = async () => {
        try {
          const response = await fetch('/api/user/info');
          if (response.ok) {
            const data = await response.json();
            // Form verisini güncellenmiş kullanıcı bilgileriyle doldur
            setFormData(prevData => ({
              ...prevData,
              first_name: data.user.first_name || '',
              last_name: data.user.last_name || '',
              email: data.user.email || session.user.email || '',
              phone: data.user.phone || '',
              address: data.user.address || ''
            }));
          } else {
            
            setFormData(prevData => ({
              ...prevData,
              email: session.user.email || '',
              first_name: session.user.first_name || '',
              last_name: session.user.last_name || '',
              phone: session.user.phone || '',
              address: session.user.address || ''
            }));
          }
        } catch (error) {
          console.error('Kullanıcı bilgileri alınamadı:', error);
          
          setFormData(prevData => ({
            ...prevData,
            email: session.user.email || '',
            first_name: session.user.first_name || '',
            last_name: session.user.last_name || '',
            phone: session.user.phone || '',
            address: session.user.address || ''
          }));
        }
      };
      
      fetchUserData();
    }
  }, [status, router, session]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    
    if (name === 'newPassword' || name === 'confirmPassword') {
      if (formData.confirmPassword && formData.newPassword !== value && name === 'confirmPassword') {
        setPasswordError('Şifreler eşleşmiyor');
      } else if (formData.newPassword && formData.confirmPassword !== value && name === 'newPassword') {
        setPasswordError('Şifreler eşleşmiyor');
      } else {
        setPasswordError('');
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setPasswordError('Şifreler eşleşmiyor');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    
    const emailChanged = formData.email !== session.user.email;
    
    
    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Bilgileriniz başarıyla güncellendi.');
        
        
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        
        if (data.requireRelogin || emailChanged) {
          await signOut({ redirect: false });
          router.push('/userlogin?updated=true');
          return;
        }
        
        
        if (session) {
          await update({
            ...session,
            user: {
              ...session.user,
              name: `${formData.first_name} ${formData.last_name}`,
              email: formData.email,
              address: formData.address,
              phone: formData.phone
            }
          });
        }
        
        
        const event = new Event("visibilitychange");
        document.dispatchEvent(event);
        
        
        setTimeout(() => {
          setSuccess('');
        }, 2000);
        
      } else {
        setError(data.message || 'Bilgileriniz güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      setError('Sunucu ile iletişim kurulurken bir hata oluştu.');
      console.error('Güncelleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Kullanıcı Bilgilerim</h1>
      
      <div className="bg-white shadow-lg rounded-lg p-8">
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            ></textarea>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Şifre Değiştir</h3>
            
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Geri Dön
            </button>
            
            <button
              type="submit"
              disabled={loading || passwordError}
              className="w-full sm:w-auto bg-orange-500 text-white py-2 px-6 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200 disabled:bg-orange-300"
            >
              {loading ? 'Güncelleniyor...' : 'Bilgilerimi Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}