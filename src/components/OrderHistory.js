'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/orders');
        
        if (!response.ok) {
          throw new Error(`Siparişler alınamadı: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Gelen sipariş verileri:', data); 
        
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          console.error('Beklenen veri formatı alınamadı:', data);
          setError('Sipariş verileriniz doğru formatta değil.');
        }
      } catch (err) {
        console.error('Siparişler yüklenirken hata:', err);
        setError('Siparişleriniz yüklenirken bir hata oluştu: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy HH:mm', { locale: tr });
    } catch (e) {
      console.error('Tarih biçimlendirme hatası:', e);
      return dateString;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Beklemede',
      approved: 'Onaylandı',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="text-center py-10">
          <h3 className="text-lg font-medium mb-2">Henüz hiç siparişiniz bulunmuyor</h3>
          <p className="text-gray-600">Sipariş oluşturduğunuzda burada görüntülenecektir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-xl font-semibold mb-6">Sipariş Geçmişim</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sipariş No
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tutar
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detay
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.totalAmount.toFixed(2)} TL
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="text-orange-600 hover:text-orange-900"
                  >
                    {selectedOrder?.id === order.id ? 'Kapat' : 'Detay Göster'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="mt-6 border rounded-lg p-4">
          <h3 className="font-medium text-lg mb-3">Sipariş #{selectedOrder.id} Detayı</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Teslim Adresi:</p>
              <p className="text-sm">{selectedOrder.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">İletişim Bilgileri:</p>
              <p className="text-sm">{selectedOrder.customerName} {selectedOrder.customerSurname} - {selectedOrder.phone}</p>
              <p className="text-sm text-gray-500">Müşteri Notu:</p>
              <p className="text-sm">{selectedOrder.customerNote}</p>
            </div>
          </div>
          
          <h4 className="font-medium mt-4 mb-2">Sipariş Edilen Ürünler</h4>
          <div className="bg-gray-50 rounded-md p-3">
            <ul className="divide-y divide-gray-200">
              {selectedOrder.orderItems && selectedOrder.orderItems.map((item) => (
                <li key={item.id} className="py-3 flex justify-between">
                  <div>
                    <span className="text-gray-900">{item.menuItem?.name || 'İsimsiz Ürün'}</span>
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="text-gray-900">{(item.price || 0).toFixed(2)} TL</span>
                </li>
              ))}
            </ul>
            
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
              <span className="font-medium">Toplam:</span>
              <span className="font-medium">{selectedOrder.totalAmount.toFixed(2)} TL</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}