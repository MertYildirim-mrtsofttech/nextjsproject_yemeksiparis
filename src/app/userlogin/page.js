// app/userlogin/page.js
'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Component that uses useSearchParams
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const updated = searchParams.get('updated');
  
  useEffect(() => {
    if (registered) {
      setSuccess('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
    }
    if (updated) {
      setSuccess('Bilgileriniz güncellendi. Lütfen yeni bilgilerinizle giriş yapın.');
    }
  }, [registered, updated]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        isAdmin: 'false', 
      });
      
      if (result.error) {
        setError('E-posta veya şifre hatalı.');
      } else {
        router.push('/userpanel');
        router.refresh();
      }
    } catch (err) {
      setError('Giriş yaparken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Giriş hatası:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Giriş Yap</h1>
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link href="/userregister" className="text-orange-500 hover:text-orange-600">
              Kayıt olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function LoadingLogin() {
  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <p>Yükleniyor...</p>
      </div>
    </div>
  );
}

export default function UserLogin() {
  return (
    <Suspense fallback={<LoadingLogin />}>
      <LoginForm />
    </Suspense>
  );
}