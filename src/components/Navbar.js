'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useCart } from './CartContext';
import { FaShoppingCart, FaHome, FaSignInAlt, FaUserShield, FaUserPlus,FaUserCircle } from 'react-icons/fa';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { cart } = useCart();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  return (
    <nav className="bg-white shadow-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link id="logo"
          href="/" 
          className="text-2xl font-bold text-orange-500 hover:text-orange-600 transition-colors duration-200"
        >
          🍽️ YemekSipariş
        </Link>
        {/* Menü Linkleri */}
        <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
          <Link
            href="/"
            className={`flex items-center gap-2 hover:text-orange-500 transition-colors duration-200 ${
              pathname === '/' ? 'text-orange-600 font-semibold' : ''
            }`}
          >
            <FaHome />
            Ana Sayfa
          </Link>
          <Link
            href="/cart"
            className={`relative flex items-center gap-2 hover:text-orange-500 transition-colors duration-200 ${
              pathname === '/cart' ? 'text-orange-600 font-semibold' : ''
            }`}
          >
            <FaShoppingCart />
            Sepet
            {cartItemCount > 0 && (
              <span className="ml-1 text-xs bg-orange-500 text-white rounded-full px-2 py-0.5">
                ({cartItemCount})
              </span>
            )}
          </Link>
          {session?.user.role === 'admin' && (
            <Link
              href="/admin/panel"
              className={`flex items-center gap-2 hover:text-orange-500 transition-colors duration-200 ${
                pathname.startsWith('/admin') ? 'text-orange-600 font-semibold' : ''
              }`}
            >
              <FaUserShield />
              Admin Paneli
            </Link>
          )}
          
          {/* Kullanıcı Giriş/Çıkış */}
          {session ? (


            <div className="flex items-center gap-2">
            
{session?.user.role === 'user' && (
           <Link
    href="/userpanel"
    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-1.5 rounded hover:bg-blue-600 transition-colors duration-200"
  >
    <FaUserCircle />
    Profilim
  </Link>
          )}



              <span id="loginname" className="text-gray-600">Merhaba, {session.user.name || 'Admin'}</span>
               <button
                onClick={() => signOut()}
                id="exit" 
                className="bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 transition-colors duration-200"
              >
                Çıkış Yap
              </button>
            </div>



          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/userlogin"
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-1.5 rounded hover:bg-blue-600 transition-colors duration-200"
              >
                <FaSignInAlt />
                Giriş Yap
              </Link>
              <Link
                href="/userregister"
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-1.5 rounded hover:bg-green-600 transition-colors duration-200"
              >
                <FaUserPlus />
                Kayıt Ol
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-1.5 rounded hover:bg-gray-600 transition-colors duration-200"
              >
                <FaUserShield />
                Yönetici Giriş
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}