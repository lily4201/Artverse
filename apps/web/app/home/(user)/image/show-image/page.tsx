"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Button } from "@kit/ui/button";
import { useRouter } from 'next/navigation';

export default function ShowImage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the image URL from localStorage
    const url = localStorage.getItem('generatedImageUrl');
    if (url) {
      setImageUrl(url);
      // Clear it after getting it
      localStorage.removeItem('generatedImageUrl');
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    console.log('Attempting to load image:', imageUrl.substring(0, 100) + '...');

    canvas.width = 800;
    canvas.height = 600;
    
    const img = new Image();
    
    // Only set crossOrigin for non-data URLs
    if (!imageUrl.startsWith('data:')) {
      img.crossOrigin = "anonymous";
    }
    
    img.onload = () => {
      console.log('Image loaded successfully');
      const imgAspectRatio = img.width / img.height;
      const canvasAspectRatio = canvas.width / canvas.height;
      
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgAspectRatio > canvasAspectRatio) {
        drawHeight = canvas.width / imgAspectRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgAspectRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    img.onerror = (e) => {
      console.error("Error loading image:", {
        urlType: imageUrl.startsWith('data:') ? 'data URL' : 'remote URL',
        urlLength: imageUrl.length,
        error: e
      });
      setError(`Failed to load image. Please try again.`);
    };

    img.src = imageUrl;

  }, [imageUrl]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'generated-image.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Button 
        className="mb-4" 
        onClick={() => router.push('/home/create-image')}
      >
        ← Back to Generator
      </Button>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Generated Image</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        {/* Canvas */}
        <div className="border rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
            style={{ maxWidth: '100%' }}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => router.push('/home/create-image')}
            >
              Create Another
            </Button>
          </div>
          <Button
            onClick={handleDownload}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
          >
            Download Image
          </Button>
        </div>
      </div>
    </div>
  );
} 