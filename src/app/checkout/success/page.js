'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import Link from 'next/link';


function LoadingState() {
  return <div className="text-center py-20">Sayfa yükleniyor...</div>;
}

// The component that uses useSearchParams must be wrapped in Suspense
function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);

  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!sessionId || hasRunRef.current) return;

    hasRunRef.current = true;

    const finalizeOrder = async () => {
      try {
        const response = await fetch('/api/checkout/success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });

        const data = await response.json();

        if (response.ok) {
          setOrderId(data.orderId);
          clearCart();
        } else {
          setError(data.error || 'Sipariş oluşturulamadı.');
        }
      } catch (err) {
        setError('Sunucu hatası: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    finalizeOrder();
  }, [sessionId, clearCart]);

  if (loading) {
    return <div className="text-center py-20">Siparişiniz işleniyor...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-600">Hata: {error}</div>;
  }

  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold text-green-600">Ödeme Başarılı!</h1>
      <p className="mb-2">Sipariş numaranız: #{orderId}</p>
      <p className="mb-6">Siparişiniz alınmıştır ve e-posta adresinize bilgi gönderilmiştir.</p>
      <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}


export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SuccessPageContent />
    </Suspense>
  );
}