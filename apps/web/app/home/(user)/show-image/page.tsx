"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Button } from "@kit/ui/button";
import { Input } from "@kit/ui/input";
import { Label } from "@kit/ui/label";

// Import required CSS
import 'tui-image-editor/dist/tui-image-editor.css';

// Define white theme
const whiteTheme = {
  'common.backgroundColor': '#fff',
  'common.border': '1px solid #c1c1c1',

  // Header
  'header.backgroundColor': 'transparent',
  'header.border': '0px',

  // Main icons
  'menu.backgroundColor': '#fff',
  'menu.normalIcon.color': '#8a8a8a',
  'menu.activeIcon.color': '#555555',
  'menu.disabledIcon.color': '#434343',
  'menu.hoverIcon.color': '#e9e9e9',

  // Submenu
  'submenu.backgroundColor': '#fff',
  'submenu.partition.color': '#e5e5e5',

  // Submenu icons
  'submenu.normalIcon.color': '#8a8a8a',
  'submenu.activeIcon.color': '#555555',
  'submenu.iconSize.width': '32px',
  'submenu.iconSize.height': '32px',

  // Checkbox
  'checkbox.border': '1px solid #ccc',
  'checkbox.backgroundColor': '#fff',

  // Range
  'range.pointer.color': '#333',
  'range.bar.color': '#ccc',
  'range.subbar.color': '#606060',
};

const ImageEditor = dynamic(
  () => import('@toast-ui/react-image-editor'),
  { 
    ssr: false,
    loading: () => <div>Loading editor...</div>
  }
);

export default function ShowImagePage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isInpainting, setIsInpainting] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const url = localStorage.getItem('generatedImageUrl');
    if (url) {
      setImageUrl(url);
    }
  }, []);

  if (!imageUrl) {
    return <div>No image URL provided</div>;
  }

  const handleGoBack = () => {
    router.push('/home');
  };

  const handleInpainting = async () => {
    try {
      setIsInpainting(true);
      const editor = editorRef.current.getInstance();

      // Get the main image
      const mainCanvas = editor.getCanvas();
      const mainImageBlob = await new Promise<Blob>((resolve) => {
        mainCanvas.toBlob((blob: Blob) => resolve(blob));
      });
      const mainImageFile = new File([mainImageBlob], 'image.png', { type: 'image/png' });

      // Get the mask from drawing
      const drawingCanvas = editor.getDrawingMode().getCanvas();
      const maskBlob = await new Promise<Blob>((resolve) => {
        drawingCanvas.toBlob((blob: Blob) => resolve(blob));
      });
      const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });

      const formData = new FormData();
      formData.append('image', mainImageFile);
      formData.append('mask', maskFile);
      formData.append('prompt', prompt);

      const response = await fetch('/api/inpainting', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setGeneratedImage(data.imageUrl);
    } catch (error) {
      console.error('Inpainting error:', error);
      alert('Failed to process inpainting');
    } finally {
      setIsInpainting(false);
    }
  };

  const handleAcceptGenerated = () => {
    if (generatedImage) {
      localStorage.setItem('generatedImageUrl', generatedImage);
      setImageUrl(generatedImage);
      setGeneratedImage(null);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 space-y-4">
        <Button onClick={handleGoBack} className="mb-4">
          Back to Home
        </Button>
        
        <div className="flex gap-4 items-end">
          <div className="flex-grow">
            <Label htmlFor="prompt">Inpainting Prompt</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to add..."
            />
          </div>
          <Button 
            onClick={handleInpainting}
            disabled={isInpainting || !prompt}
          >
            {isInpainting ? 'Processing...' : 'Generate Inpainting'}
          </Button>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="relative">
          <ImageEditor
            ref={editorRef}
            includeUI={{
              loadImage: {
                path: imageUrl,
                name: 'GeneratedImage'
              },
              theme: whiteTheme,
              uiSize: {
                width: '100%',
                height: '100%'
              },
              menuBarPosition: 'bottom'
            }}
            cssMaxHeight={800}
            cssMaxWidth={1200}
            usageStatistics={false}
          />
        </div>

        {generatedImage && (
          <div className="relative flex flex-col gap-4">
            <img 
              src={generatedImage} 
              alt="Generated inpainting"
              className="w-full h-auto rounded-lg"
            />
            <div className="flex gap-2 justify-center">
              <Button onClick={handleAcceptGenerated}>Accept</Button>
              <Button 
                variant="outline" 
                onClick={() => setGeneratedImage(null)}
              >
                Decline
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

