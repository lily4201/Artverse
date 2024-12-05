"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function ShowImage() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('imageUrl');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState("draw");
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#000000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [brushOpacity, setBrushOpacity] = useState(100);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Load image
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = imageUrl;
    }

    setContext(ctx);
  }, [imageUrl]);

  const startDrawing = (e: React.MouseEvent) => {
    if (!context || activeTab !== "draw") return;
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    context.beginPath();
    context.moveTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !context || activeTab !== "draw") return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    context.lineWidth = brushSize;
    context.strokeStyle = brushColor;
    context.lineTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 bg-gray-50 p-1 rounded-lg">
            {["Draw", "Shape", "Text", "Select", "Transform", "Filter"].map((tab) => (
              <button
                key={tab.toLowerCase()}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-6 py-2 rounded-lg transition-all ${
                  activeTab === tab.toLowerCase()
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        {activeTab === "draw" && (
          <div className="mb-6 space-y-6">
            <div className="flex items-center gap-4">
              <span className="w-20 font-medium">Size:</span>
              <div className="flex-1 flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-16 text-gray-600">{brushSize}px</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="w-20 font-medium">Opacity:</span>
              <div className="flex-1 flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brushOpacity}
                  onChange={(e) => setBrushOpacity(Number(e.target.value))}
                  className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-16 text-gray-600">{brushOpacity}%</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-20 font-medium">Color:</span>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 p-1 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-auto cursor-crosshair"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button className="px-4 py-2 flex items-center gap-2 bg-white border rounded-lg hover:bg-gray-50">
            ↩ Undo
          </button>
          <button className="px-4 py-2 flex items-center gap-2 bg-white border rounded-lg hover:bg-gray-50">
            ↪ Redo
          </button>
          <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            Clear
          </button>
          <button className="px-4 py-2 flex items-center gap-2 bg-white border rounded-lg hover:bg-gray-50">
            🔍 Zoom In
          </button>
          <button className="px-4 py-2 flex items-center gap-2 bg-white border rounded-lg hover:bg-gray-50">
            🔍 Zoom Out
          </button>
          <span className="flex items-center">100%</span>
          <button
            onClick={handleDownload}
            className="px-6 py-2 ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600"
          >
            ⬇ Download
          </button>
        </div>
      </div>
    </div>
  );
} 