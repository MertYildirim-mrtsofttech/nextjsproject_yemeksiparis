'use client';

import { useEffect, useState, useRef } from 'react';
import ChatBox from './ChatBox';

export default function ForumChat({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesRef = useRef([]); 
  const messageContainerRef = useRef(null); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  
  const addNewMessageToDOM = (msg) => {
  if (!messageContainerRef.current) return;

  const isCurrentUser = currentUser.email === msg.email;
  const userName = `${msg.first_name} ${msg.last_name}`;

  const messageDiv = document.createElement('div');
  messageDiv.className = `flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} mt-4`;

  const messageContent = document.createElement('div');
  messageContent.id = isCurrentUser ? 'msg' : 'msg-other';
  messageContent.className = `max-w-[80%] p-3 rounded-lg ${isCurrentUser ? 'bg-orange-100' : 'bg-gray-200'} text-gray-800`;

  const nameDiv = document.createElement('div');
  nameDiv.className = 'font-medium text-sm mb-1';
  nameDiv.textContent = userName;
  messageContent.appendChild(nameDiv);

  if (msg.message) {
    const p = document.createElement('p');
    p.textContent = msg.message;
    messageContent.appendChild(p);
  }

  if (msg.image_path) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'mt-2';

    const img = document.createElement('img');
    img.src = msg.image_path;
    img.alt = 'Mesaj resmi';
    img.className = 'w-[150px] rounded-md'; 

    img.onload = () => {
      imageWrapper.appendChild(img);
      messageContent.appendChild(imageWrapper);

      const dateDiv = document.createElement('div');
      dateDiv.className = 'text-xs text-gray-500 mt-1 text-right';
      dateDiv.textContent = formatDate(msg.created_at);
      messageContent.appendChild(dateDiv);

      messageDiv.appendChild(messageContent);
      messageContainerRef.current.appendChild(messageDiv);
      scrollToBottom();
    };
  } else {
    const dateDiv = document.createElement('div');
    dateDiv.className = 'text-xs text-gray-500 mt-1 text-right';
    dateDiv.textContent = formatDate(msg.created_at);
    messageContent.appendChild(dateDiv);

    messageDiv.appendChild(messageContent);
    messageContainerRef.current.appendChild(messageDiv);
    scrollToBottom();
  }
};


  
  const fetchMessages = async () => {
    if (messagesRef.current.length === 0) {
      setLoading(true);
    }
    
    try {
      const response = await fetch('/api/messages/forum');
      if (response.ok) {
        const data = await response.json();
        const newMessages = data.messages.reverse(); 
        
        
        if (messagesRef.current.length === 0) {
          messagesRef.current = newMessages;
          setMessages(newMessages);
          return;
        }
        
        
        const existingIds = new Set(messagesRef.current.map(m => m.id));
        const actualNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
        
        
        if (actualNewMessages.length > 0) {
          actualNewMessages.forEach(msg => {
            addNewMessageToDOM(msg);
          });
          
          
          messagesRef.current = newMessages;
        }
      }
    } catch (error) {
      console.error('Forum mesajları alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  
  const handleSendMessage = async (message, imagePath) => {
    try {
      const response = await fetch('/api/messages/forum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          imagePath 
        }),
      });

      if (response.ok) {
        
        fetchMessages();
      }
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
    }
  };

  
  useEffect(() => {
    fetchMessages();
    
    
    const intervalId = setInterval(fetchMessages, 5000);
    
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
      <h2 className="text-xl font-semibold mb-4">Genel Sohbet</h2>
      
      <div className="border rounded-lg h-96 overflow-y-auto mb-4 p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 my-8">Henüz mesaj bulunmuyor.</p>
        ) : (
          <div className="space-y-4" ref={messageContainerRef}>
            {messages.map((msg) => {
              const isCurrentUser = currentUser.email === msg.email;
              const userName = `${msg.first_name} ${msg.last_name}`;
              
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
      
      <ChatBox onSendMessage={handleSendMessage} placeholder="Genel sohbete mesaj yazın..." />
    </div>
  );
}