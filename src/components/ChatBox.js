'use client';

import { useState, useRef } from 'react';

export default function ChatBox({ onSendMessage, placeholder = "Mesajınızı yazın..." }) {
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    if (!message.trim() && !imageFile) {
      return;
    }
    
    
    let uploadedImagePath = null;
    if (imageFile) {
      setUploading(true);
      try {
        uploadedImagePath = await uploadImage(imageFile);
        console.log("Uploaded image path:", uploadedImagePath); // Debug için log ekleyelim
      } catch (error) {
        console.error('Resim yüklenirken hata:', error);
        alert('Resim yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        setUploading(false);
        return;
      }
    }
    
    
    await onSendMessage(message, uploadedImagePath);
    
    // Form alanlarını temizle
    setMessage('');
    setImageFile(null);
    setImagePreview('');
    setUploading(false);
    
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Resim yüklenemedi');
    }
    
    const data = await response.json();
    return data.filePath; // API'nin döndürdüğü dosya yolunu döndür
  };
  
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }
    
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Desteklenmeyen dosya türü! Sadece JPG, PNG, GIF ve WEBP formatları desteklenir.');
      setImageFile(null);
      setImagePreview('');
      fileInputRef.current.value = '';
      return;
    }
    
    
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 5) {
      alert('Dosya boyutu çok büyük! Maksimum 5MB olmalıdır.');
      setImageFile(null);
      setImagePreview('');
      fileInputRef.current.value = '';
      return;
    }
    
    setImageFile(file);
    
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div  className="w-full">
      {/* Resim yükleme alanı - Her zaman görünür olacak şekilde düzenlendi */}
     
        <div id="imgsndbtn" className="flex flex-col items-center justify-center">
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-20 cursor-pointer hover:bg-gray-100 rounded-md"
          >
            <div className="flex flex-col items-center justify-center">
              
              <p className="mt-1 text-sm text-gray-600">📁(Resim gönder)</p>
              
            </div>
            <input
              type="file"
              id="image-upload"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp"
            />
          </label>
        </div>
      

      {/* Resim önizleme alanı */}
      {imagePreview && (
        <div className="relative mb-2 inline-block">
          <img id="preimage"
            src={imagePreview} 
            alt="Yüklenecek resim" 
            className="max-h-40 max-w-full rounded-md border border-gray-300"
          />
          <button style={{position:"absolute",top:5,left:160,width:5,}}
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            type="button"
          >
            ×
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center mt-2">
        {/* Mesaj yazma alanı */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          disabled={uploading}
        />
        
        {/* Gönder butonu */}
        <button
          type="submit"
          className={`bg-orange-500 text-white px-4 py-2 rounded-r-md hover:bg-orange-600 transition-colors flex items-center ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="animate-spin mr-2">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              Yükleniyor
            </>
          ) : (
            'Gönder'
          )}
        </button>
      </form>
    </div>
  );
}