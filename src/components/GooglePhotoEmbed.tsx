import React from 'react';

interface GooglePhotoEmbedProps {
  url: string;
  alt: string;
  className?: string;
}

const GooglePhotoEmbed: React.FC<GooglePhotoEmbedProps> = ({ url, alt, className }) => {
  // Convert Google Drive photo URL to an embeddable format
  const getEmbedUrl = (url: string): string => {
    if (url.includes('drive.google.com/file/d/')) {
      // Extract file ID from URL
      const matches = url.match(/\/d\/(.+?)\/view/);
      if (matches && matches[1]) {
        return `https://drive.google.com/thumbnail?id=${matches[1]}&sz=w400`;
      }
    } else if (url.includes('photos.app.goo.gl')) {
      // For Google Photos links, we can't easily convert them
      // In a real implementation, you would need to handle this differently
      return 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg';
    }
    
    return url;
  };

  return (
    <img 
      src={getEmbedUrl(url)} 
      alt={alt} 
      className={`object-cover rounded-lg ${className || ''}`}
      onError={(e) => {
        // Fallback image if the Google Drive image fails to load
        (e.target as HTMLImageElement).src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
      }}
    />
  );
};

export default GooglePhotoEmbed;