// app/userpanel/page.js
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ForumChat from '@/components/ForumChat';
import DirectChat from '@/components/DirectChat';
import OrderHistory from '@/components/OrderHistory';

export default function UserPanel() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('panel'); 
  
  
  useEffect(() => {
    
    if (status === 'unauthenticated') {
      router.push('/userlogin');
      return;
    }
    
    
    if (status === 'authenticated' && session?.user?.email && !userData) {
      const fetchUserData = async () => {
        try {
          const response = await fetch('/api/user/info');
          if (response.ok) {
            const data = await response.json();
            setUserData(data.user);
          }
        } catch (error) {
          console.error('Kullanıcı bilgileri alınamadı:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserData();
    } else if (status === 'authenticated') {
      
      setIsLoading(false);
    }
  }, [status, router, session?.user?.email, userData]);

  
  useEffect(() => {
    const updateSessionIfNeeded = async () => {
      if (userData && status === 'authenticated' && session) {
        
        const needsUpdate = 
          userData.name !== session.user.name || 
          userData.email !== session.user.email || 
          userData.address !== session.user.address || 
          userData.phone !== session.user.phone;
        
        if (needsUpdate) {
          await update({
            ...session,
            user: {
              ...session.user,
              name: userData.name,
              email: userData.email,
              address: userData.address,
              phone: userData.phone
            }
          });
        }
      }
    };
    
    updateSessionIfNeeded();
  }, [userData, status, session, update]);

  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  
  if (session) {
   
    const user = userData || session.user;
    const displayName = user?.name || user?.email;
    
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Kullanıcı Paneli</h1>
        
        {/* Sekmeler */}
        <div className="flex justify-center mb-8 overflow-x-auto">
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
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                activeTab === 'orders'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              } focus:z-10 focus:ring-2 focus:ring-orange-300`}
            >
              Sipariş Geçmişim
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('forum')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
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
          </div>
        </div>
        
        {/* Ana Panel */}
        {activeTab === 'panel' && (
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Hoş Geldiniz, {displayName}</h2>
              <p className="text-gray-600 mb-6">Hesabınızla ilgili işlemleri aşağıdaki butonlardan gerçekleştirebilirsiniz.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-medium mb-3">Sepet İşlemleri</h3>
                <p className="text-gray-600 mb-4">Sepetinizdeki ürünleri görüntüleyin ve satın alma işlemlerini gerçekleştirin.</p>
                <button 
                  onClick={() => router.push('/cart')}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
                >
                  Sepete Git
                </button>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-medium mb-3">Kullanıcı Bilgileriniz</h3>
                <p className="text-gray-600 mb-4">Kişisel bilgilerinizi güncelleyin ve hesap ayarlarınızı yönetin.</p>
                <button 
                  onClick={() => router.push('/userinfo')}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
                >
                  Bilgilerimi Güncelle
                </button>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-medium mb-3">Sipariş Geçmişim</h3>
                <p className="text-gray-600 mb-4">Önceki siparişlerinizi görüntüleyin ve takip edin.</p>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
                >
                  Siparişlerim
                </button>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-medium mb-3">Mesajlaşma</h3>
                <p className="text-gray-600 mb-4">Diğer kullanıcılarla mesajlaşmak için mesajlaşma sekmelerini kullanabilirsiniz.</p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setActiveTab('forum')}
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
                  >
                    Genel Sohbet
                  </button>
                  <button 
                    onClick={() => setActiveTab('direct')}
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
                  >
                    Özel Mesajlar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Sipariş Geçmişi */}
        {activeTab === 'orders' && <OrderHistory />}
        
        {/* Genel Sohbet */}
        {activeTab === 'forum' && (
          <ForumChat currentUser={{
            id: user?.id,
            email: user?.email,
            name: displayName
          }} />
        )}
        
        {/* Özel Mesajlar */}
        {activeTab === 'direct' && (
          <DirectChat currentUser={{
            id: user?.id,
            email: user?.email,
            name: displayName
          }} />
        )}
      </div>
    );
  }

  return null;
}