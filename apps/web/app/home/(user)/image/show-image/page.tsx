"use client";

import { useSearchParams } from 'next/navigation';

export default function ShowImage() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('imageUrl');

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Generated Image</h1>
      {imageUrl ? (
        <img src={imageUrl} alt="Generated" className="w-full h-auto max-w-2xl mx-auto" />
      ) : (
        <div>No image available</div>
      )}
    </div>
  );
} 