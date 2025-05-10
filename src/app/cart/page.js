'use client';

import { useCart } from '@/components/CartContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotalAmount } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  
  if (cart.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Sepetiniz</h1>
        <p className="text-gray-500 mb-4">Sepetiniz boş.</p>
        <Link 
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Alışverişe Devam Et
        </Link>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      {session && (
        <div className="bg-green-100 rounded-lg p-4 mb-6 text-center">
          <p className="text-green-700">
            Hoş geldin, <span className="font-bold">{session.user.name}</span>!
          </p>
        </div>
      )}
      
      <h1 className="text-2xl font-bold mb-6 text-center">Sepetiniz</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Ürün</th>
              <th className="text-center py-2">Fiyat</th>
              <th className="text-center py-2">Adet</th>
              <th className="text-right py-2">Toplam</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => {
              // Fiyatı bir sayıya çevir ve kontrol et
              const price = parseFloat(item.price);

              return (
                <tr key={item.id} className="border-b">
                  <td className="py-4">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.category_name || 'Kategorisiz'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-4">
                    {!isNaN(price) ? price.toFixed(2) : 'Geçersiz Fiyat'} TL
                  </td>
                  <td className="text-center py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="border rounded-l px-2 py-1 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="border-t border-b px-3 py-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="border rounded-r px-2 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="text-right py-4">
                    {!isNaN(price) ? (price * item.quantity).toFixed(2) : 'Geçersiz'} TL
                  </td>
                  <td className="text-right py-4">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Kaldır
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-6">
        <div>
          <Link 
            href="/"
            className="text-blue-500 hover:text-blue-700"
          >
            Alışverişe Devam Et
          </Link>
        </div>
        
        <div className="text-right">
          <div className="text-xl font-semibold mb-2">
            Toplam: {getTotalAmount().toFixed(2)} TL
          </div>
          {session ? (
            <Link
              href="/checkout"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
            >
              Sipariş Ver
            </Link>
          ) : (
            <Link
              href="/userlogin"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded"
            >
              Giriş Yaparak Devam Et
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}