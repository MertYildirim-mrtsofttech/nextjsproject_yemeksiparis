'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import ForumChat from '@/components/ForumChat';
import DirectChat from '@/components/DirectChat';
import BannerManagement from '@/components/BannerManagement';
import DiscountManagement from '@/components/DiscountManagement';

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('panel'); 

  useEffect(() => {
    if (status === 'loading') return; 

    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      router.push('/login');
    }
  }, [status, session, router]);

  const navigateTo = (path) => {
    router.push(`/admin/${path}`);
  };
  
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Yönetici Paneli</h1>
              </div>
            </div>
            <div className="flex items-center">
              {/*<button
                onClick={handleLogout}
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Çıkış Yap
              </button>*/}


            </div>
          </div>
        </div>
      </div>



      {/* Sekmeler */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setActiveTab('panel')}
              className={`px-4 py-2 text-sm font-medium border ${
                activeTab === 'panel'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              } rounded-l-lg focus:z-10 focus:ring-2 focus:ring-orange-300`}
            >
              Ana Panel
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('forum')}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                activeTab === 'forum'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              } focus:z-10 focus:ring-2 focus:ring-orange-300`}
            >
              Genel Sohbet
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`px-4 py-2 text-sm font-medium border ${
                activeTab === 'direct'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              } rounded-r-md focus:z-10 focus:ring-2 focus:ring-orange-300`}
            >
              Özel Mesajlar
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('banners')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                activeTab === 'banners'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              } focus:z-10 focus:ring-2 focus:ring-orange-300`}
            >
              Banner Yönetimi
            </button>

            <button
            type="button"
            onClick={() => setActiveTab('discounts')}
            className={`px-4 py-2 text-sm font-medium border-t border-b ${
              activeTab === 'discounts'
      ? 'bg-orange-500 text-white border-orange-500'
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
    } focus:z-10 focus:ring-2 focus:ring-orange-300`}
    >
    İndirim Kodları
    </button>


            
          </div>
        </div>
        
        {/* Ana Panel */}
        {activeTab === 'panel' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Menü İşlemleri */}
              <div onClick={() => navigateTo('menu')} className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Menü İşlemleri</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">Menü düzenle</div>
                        </dd>
                      </dl>
                    </div>

                  </div>
                </div>
              </div>

                   {/* Banner İşlemleri */}
              <div onClick={() => setActiveTab('banners')} className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Banner İşlemleri</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">Banner yönet</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>


              
              {/* Kullanıcı İşlemleri */}
              <div onClick={() => navigateTo('users')} className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Kullanıcı İşlemleri</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">Kullanıcıları yönet</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Şifre İşlemleri */}
              <div onClick={() => navigateTo('password')} className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Şifre İşlemleri</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">Şifre değiştir</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sipariş İşlemleri */}
              <div onClick={() => navigateTo('orders')} className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Sipariş İşlemleri</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">Siparişleri yönet</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mesajlaşma kısmı için panel içinde ayrıca butonlar */}
              <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-300 sm:col-span-2 lg:col-span-4">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 bg-teal-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Mesajlaşma Sistemi</h3>
                      <p className="text-sm text-gray-500">Site genelinde mesajlaşma hizmetlerini yönetin</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab('forum')}
                      className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
                    >
                      Genel Sohbet
                    </button>
                    <button
                      onClick={() => setActiveTab('direct')}
                      className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
                    >
                      Özel Mesajlar
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <Link href="/admin/clean">
        <button className="bg-red-600 text-white px-4 py-2 rounded">
          Sistemi Temizle
        </button>
      </Link>
          </div>
        )}
        
        {/* Genel Sohbet */}
        {activeTab === 'forum' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Genel Sohbet - Yönetici Görünümü</h2>
              <button
                onClick={() => setActiveTab('panel')}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Panele Dön
              </button>
            </div>
            <ForumChat 
              currentUser={{
                id: session?.user?.id,
                email: session?.user?.email,
                name: session?.user?.name || session?.user?.email,
                role: 'admin' // Yönetici rolünü ekledik
              }} 
            />
          </div>
        )}
        
        {/* Banner Yönetimi */}
        {activeTab === 'banners' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Banner Yönetimi</h2>
              <button
                onClick={() => setActiveTab('panel')}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Panele Dön
              </button>
            </div>
            <BannerManagement />
          </div>
        )}
        
        {/* Özel Mesajlar */}
        {activeTab === 'direct' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Özel Mesajlar - Yönetici Görünümü</h2>
              <button
                onClick={() => setActiveTab('panel')}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Panele Dön
              </button>
            </div>
            <DirectChat 
              currentUser={{
                id: session?.user?.id,
                email: session?.user?.email,
                name: session?.user?.name || session?.user?.email,
                role: 'admin' // Yönetici rolünü ekledik
              }} 
            />
          </div>
        )}

        {/* İndirim Kodları Sekmesi */}
{activeTab === 'discounts' && (
  <div className="bg-white shadow rounded-lg p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">İndirim Kodları Yönetimi</h2>
      <button
        onClick={() => setActiveTab('panel')}
        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        Panele Dön
      </button>
    </div>
    <DiscountManagement />
  </div>
)}
      </div>
    </div>
  );
}