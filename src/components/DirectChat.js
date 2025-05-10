'use client';

import { useEffect, useState, useRef } from 'react';
import ChatBox from './ChatBox';

export default function DirectChat({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({}); 
  const messagesEndRef = useRef(null);
  const messagesRef = useRef([]); 
  const messageContainerRef = useRef(null); 
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/list');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        
        
        fetchUnreadCounts();
      }
    } catch (error) {
      console.error('Kullanıcı listesi alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  const fetchUnreadCounts = async () => {
    try {
      const response = await fetch('/api/messages/unread-counts');
      if (response.ok) {
        const data = await response.json();
        // { userId: count } 
        const counts = {};
        data.unreadCounts.forEach(item => {
          counts[item.sender_id] = item.count;
        });
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Okunmamış mesaj sayıları alınamadı:', error);
    }
  };

  
const addNewMessageToDOM = (msg) => {
  if (!messageContainerRef.current) return;

  const isCurrentUser = msg.sender_id === currentUser.id;
  const userName = isCurrentUser 
    ? `${currentUser.name}`
    : `${msg.sender_first_name} ${msg.sender_last_name}`;

  
  const messageDiv = document.createElement('div');
  messageDiv.className = `flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} mt-4`;

  
  let messageHTML = `
    <div id="${isCurrentUser ? 'msg' : 'msg-other'}" 
         class="max-w-[80%] p-3 rounded-lg ${isCurrentUser ? 'bg-orange-100' : 'bg-gray-200'} text-gray-800">
      <div class="font-medium text-sm mb-1">${userName}</div>
  `;

  
  if (msg.message) {
    messageHTML += `<p>${msg.message}</p>`;
  }

  
  if (msg.image_path) {
    messageHTML += `<div class="mt-2">
      <img src="${msg.image_path}" alt="Mesaj resmi" class="w-[150px] rounded-md" />
    </div>`;
  }

  
  messageHTML += `
      <div class="text-xs text-gray-500 mt-1 text-right">
        ${formatDate(msg.created_at)}
      </div>
    </div>
  `;

  messageDiv.innerHTML = messageHTML;

  
  messageContainerRef.current.appendChild(messageDiv);
  scrollToBottom();
};


  
  const fetchMessages = async (userId) => {
    if (!userId) return;
    
    if (messagesRef.current.length === 0) {
      setLoadingMessages(true);
    }
    
    try {
      const response = await fetch(`/api/messages/direct?receiverId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        
        
        if (messagesRef.current.length === 0) {
          messagesRef.current = data.messages;
          setMessages(data.messages);
          
          
          if (unreadCounts[userId]) {
            setUnreadCounts(prev => ({
              ...prev,
              [userId]: 0
            }));
          }
          
          return;
        }
        
        
        const existingIds = new Set(messagesRef.current.map(m => m.id));
        const newMessages = data.messages.filter(msg => !existingIds.has(msg.id));
        
        
        if (newMessages.length > 0) {
          newMessages.forEach(msg => {
            addNewMessageToDOM(msg);
          });
          
          
          messagesRef.current = data.messages;
        }
      }
    } catch (error) {
      console.error('Özel mesajlar alınamadı:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  
  const handleSendMessage = async (message, imagePath) => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch('/api/messages/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          receiverId: selectedUser.id,
          message,
          imagePath
        }),
      });

      if (response.ok) {
        
        fetchMessages(selectedUser.id);
      }
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
    }
  };

  
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    messagesRef.current = []; 
    setMessages([]); 
    
    
    setUnreadCounts(prev => ({
      ...prev,
      [user.id]: 0
    }));
    
    fetchMessages(user.id);
  };

  
  useEffect(() => {
    fetchUsers();
    
    
    fetchUnreadCounts();
  }, []);

  
  useEffect(() => {
    if (!selectedUser) return;
    
    
    const intervalId = setInterval(() => {
      fetchMessages(selectedUser.id);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [selectedUser]);
  
  
  useEffect(() => {
    
    const intervalId = setInterval(() => {
      fetchUnreadCounts();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Özel Mesajlar</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Kullanıcı Listesi */}
          <div className="col-span-1 border rounded-lg overflow-y-auto h-96 bg-gray-50">
            {users.length === 0 ? (
              <p className="text-center text-gray-500 my-8">Kullanıcı bulunamadı.</p>
            ) : (
              <ul>
                {users.map((user) => (
                  <li 
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0 relative ${
                      selectedUser?.id === user.id ? 'bg-orange-50' : ''
                    }`}
                  >
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    
                    {/* Okunmamış mesaj baloncuğu */}
                    {unreadCounts[user.id] > 0 && (
                      <div className="absolute top-1 right-1 flex items-center justify-center">
                        <span id="unrdmsg" className="animate-pulse bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-md min-w-5 h-5 flex items-center justify-center">
                          {unreadCounts[user.id]}yeni mesaj
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Mesaj Alanı */}
          <div className="col-span-2">
            {!selectedUser ? (
              <div className="border rounded-lg h-96 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Mesajlaşmak için bir kullanıcı seçin.</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-100 p-3 rounded-t-lg">
                  <h3 className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
                
                <div className="border rounded-b-lg h-80 overflow-y-auto p-4 bg-gray-50">
                  {loadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-gray-500 my-8">Henüz mesaj bulunmuyor.</p>
                  ) : (
                    <div className="space-y-4" ref={messageContainerRef}>
                      {messages.map((msg) => {
                        const isCurrentUser = msg.sender_id === currentUser.id;
                        const userName = isCurrentUser 
                          ? `${currentUser.name}`
                          : `${msg.sender_first_name} ${msg.sender_last_name}`;
                        
                        return (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                          >
                            <div id={isCurrentUser ? "msg" : "msg-other"}
                              className={`max-w-[80%] p-3 rounded-lg ${
                                isCurrentUser 
                                  ? 'bg-orange-100 text-gray-800' 
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              <div className="font-medium text-sm mb-1">{userName}</div>
                              {msg.message && <p>{msg.message}</p>}
                              {msg.image_path && (
                                <div className="mt-2">
                                  <img id="imgsize"
                                    src={msg.image_path} 
                                    alt="Mesaj resmi"
                                    className="max-w-full rounded-md"
                                  />
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mt-1 text-right">
                                {formatDate(msg.created_at)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                <ChatBox 
                  onSendMessage={handleSendMessage} 
                  placeholder={`${selectedUser.firstName} ${selectedUser.lastName} adlı kullanıcıya mesaj yazın...`} 
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}