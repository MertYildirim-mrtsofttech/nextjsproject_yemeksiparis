// app/admin/users/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  //const { data: session } = useSession();

    useEffect(() => {
    if (status === 'loading') return; 

    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      router.push('/login');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.id) {
      setCurrentAdminId(session.user.id);
    }
    fetchUsers();
  }, [session]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Kullanıcılar alınamadı');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Kullanıcıları yüklerken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentAdminId) {
      setError('Kendi hesabınızı silemezsiniz');
      return;
    }

    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Kullanıcı silinemedi');
        }

        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        setError('Kullanıcı silinirken bir hata oluştu');
        console.error(err);
      }
    }
  };

  const toggleAdminStatus = async (userId) => {
    if (userId === currentAdminId) {
      setError('Kendi admin statünüzü değiştiremezsiniz');
      return;
    }

    try {
      const user = users.find(u => u.id === userId);
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Kullanıcı rolü değiştirilemedi');
      }

      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, role: newRole };
        }
        return user;
      }));
    } catch (err) {
      setError('Rol değiştirilirken bir hata oluştu');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-lg leading-6 font-medium text-gray-900">Kullanıcı Yönetimi</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Tüm kullanıcıları görüntüle ve yönet</p>
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

          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            {loading ? (
              <div className="text-center py-10">
                <p>Yükleniyor...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ad Soyad
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        E-posta
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefon
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => toggleAdminStatus(user.id)}
                            disabled={user.id === currentAdminId}
                            className={`mr-2 px-3 py-1 rounded-md ${
                              user.id === currentAdminId 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : user.role === 'admin' 
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {user.role === 'admin' ? 'Adminliği Kaldır' : 'Admin Yap'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentAdminId}
                            className={`px-3 py-1 rounded-md ${
                              user.id === currentAdminId 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}