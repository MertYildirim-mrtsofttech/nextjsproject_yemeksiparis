// app/admin/password/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function PasswordManagement() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
   const { data: session, status,update } = useSession();
  const router = useRouter();
  

    useEffect(() => {
    if (status === 'loading') return; 

    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      router.push('/login');
    }
  }, [status, session, router]);

  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError('Yeni şifreler eşleşmiyor.');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Şifre değiştirme başarısız.');
      }
      
      setSuccess('Şifreniz başarıyla değiştirildi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Şifre değiştirirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEmailChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newEmail) {
      setError('Lütfen yeni e-posta adresinizi girin.');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newEmail,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'E-posta değiştirme başarısız.');
      }
      
      setSuccess('E-posta adresiniz başarıyla değiştirildi.');
      
      await update({ email: newEmail });
      setCurrentPassword('');
      setNewEmail('');
    } catch (err) {
      setError(err.message || 'E-posta değiştirirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-lg leading-6 font-medium text-gray-900">Şifre ve E-posta Yönetimi</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Şifrenizi ve e-posta adresinizi değiştirin</p>
            </div>
            <button
              onClick={() => router.push('/admin/panel')}
              className="bg-gray-100 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none"
            >
              Panel&apos;e Dön
            </button>
          </div>
          
          {error && (
            <div className="mx-4 my-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mx-4 my-2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          <div className="border-t border-gray-200 px-4 py-5">
            <h2 className="text-md font-medium text-gray-900 mb-4">Şifre Değiştir</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre Tekrar
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
              >
                {loading ? 'İşleniyor...' : 'Şifreyi Değiştir'}
              </button>
            </form>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5">
            <h2 className="text-md font-medium text-gray-900 mb-4">E-posta Değiştir</h2>
            <form onSubmit={handleEmailChange}>
              <div className="mb-4">
                <label htmlFor="currentPasswordForEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  id="currentPasswordForEmail"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni E-posta
                </label>
                <input
                  type="email"
                  id="newEmail"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
              >
                {loading ? 'İşleniyor...' : 'E-posta Değiştir'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}