'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { use } from 'react';  

export default function OrderSummary({ params }) {
  const unwrappedParams = use(params);  
  const orderId = unwrappedParams.id;   
  
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

   useEffect(() => {
    if (status === 'loading') return; 

    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      router.push('/login');
    }
  }, [status, session, router]);
  
  const fetchOrderData = async () => {
    try {
      
      const orderResponse = await fetch(`/api/admin/orders/${orderId}`);
      if (!orderResponse.ok) {
        throw new Error('Sipariş detayları alınamadı');
      }
      const orderData = await orderResponse.json();
      setOrder(orderData);
      
      
      const itemsResponse = await fetch(`/api/admin/orders/${orderId}/items`);
      if (!itemsResponse.ok) {
        throw new Error('Sipariş öğeleri alınamadı');
      }
      const itemsData = await itemsResponse.json();
      setOrderItems(itemsData);
    } catch (err) {
      setError('Sipariş bilgilerini yüklerken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const updateOrderStatus = async (newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Sipariş durumu güncellenemedi');
      }
      
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      setError('Sipariş durumu güncellenirken bir hata oluştu');
      console.error(err);
    }
  };

  const cancelOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      
      if (!response.ok) {
        throw new Error('Sipariş iptal edilemedi');
      }
      
      setOrder({ ...order, status: 'cancelled' });
    } catch (err) {
      setError('Sipariş iptal edilirken bir hata oluştu');
      console.error(err);
    }
  };

  async function deleteOrder(orderId) {
  const confirmed = confirm("Siparişi silmek istediğinize emin misiniz?");
  if (!confirmed) return;

  try {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Hata: " + data.error);
      return;
    }

     else if (res.ok) {
        router.push("/admin/orders") 
      }

    alert("Sipariş başarıyla silindi");
    //window.location.reload();
  } catch (error) {
    console.error("Silme hatası:", error);
    alert("Bir hata oluştu.");
  }
}

  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR');
  };
  
  const calculateTotalPrice = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <strong className="font-bold">Hata!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/admin/orders')}
              className="bg-gray-100 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none"
            >
              Siparişlere Dön
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded" role="alert">
            <span className="block sm:inline">Sipariş bulunamadı.</span>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/admin/orders')}
              className="bg-gray-100 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none"
            >
              Siparişlere Dön
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-lg leading-6 font-medium text-gray-900">
                  Sipariş #{orderId} Detayları
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/orders')}
                className="bg-gray-100 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none"
              >
                Siparişlere Dön
              </button>


            </div>
          </div>
          
          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            {/* Customer and Order Information */}
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2 mb-3">Müşteri Bilgileri</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">İsim:</span> {order.customerName} {order.customerSurname}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">E-posta:</span> {order.email}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Telefon:</span> {order.phone}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Adres:</span> {order.address}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2 mb-3">Sipariş Bilgileri</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Toplam Tutar:</span> {order.totalAmount} ₺
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Durum:</span> 
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      order.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'pending' ? 'Beklemede' : 
                       order.status === 'approved' ? 'Onaylandı' : 'İptal Edildi'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Ödeme Durumu:</span> {order.paymentStatus ? 'Ödendi' : 'Ödenmedi'}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Müşteri Notu:</span> {order.customerNote}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Order Actions */}
            <div className="mt-4 flex space-x-2">
              {order.status !== 'cancelled' && (
                <>
                  <button
                    onClick={() => updateOrderStatus(order.status === 'pending' ? 'approved' : 'pending')}
                    className={`px-3 py-1 rounded-md ${
                      order.status === 'pending' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    {order.status === 'pending' ? 'Siparişi Onayla' : 'Siparişi Beklet'}
                  </button>
                  
                  <button
                    onClick={cancelOrder}
                    className="px-3 py-1 rounded-md bg-red-100 text-red-800 hover:bg-red-200"
                  >
                    Siparişi İptal Et
                  </button>
                </>
              )}
              
                           <button 
  onClick={() => deleteOrder(order.id)} 
  className="bg-red-500 text-white px-4 py-2 rounded"
>
  Sil
</button>
            </div>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2 mb-3">Sipariş Öğeleri</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Birim Fiyat
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adet
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.menu_item && item.menu_item.image_url && (
                          <div className="w-16 h-16 flex-shrink-0 rounded-md border border-gray-200 bg-white overflow-hidden">
                            <img 
                              className="w-16 h-16 object-cover" 
                              src={item.menu_item.image_url} 
                              alt={item.menu_item?.name || 'Ürün görseli'} 
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.menu_item ? item.menu_item.name : 'Ürün adı bulunamadı'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.price} ₺</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{(item.price * item.quantity).toFixed(2)} ₺</div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">Genel Toplam:</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{calculateTotalPrice()} ₺</div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Siparişi Sil</h3>
            <p className="text-gray-700 mb-6">
              Bu siparişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                onClick={deleteOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}