import React, { useRef, useEffect } from 'react';

interface SketchPadProps {
  onDraw: (data: string) => void;
}

export const SketchPad: React.FC<SketchPadProps> = ({ onDraw }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let drawing = false;

    const startDrawing = () => {
      drawing = true;
    };

    const stopDrawing = () => {
      drawing = false;
      context.beginPath();
      onDraw(canvas.toDataURL());
    };

    const draw = (event: MouseEvent) => {
      if (!drawing) return;
      context.lineWidth = 5;
      context.lineCap = 'round';
      context.strokeStyle = '#000';

      context.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
      context.stroke();
      context.beginPath();
      context.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mousemove', draw);
    };
  }, [onDraw]);

  return <canvas ref={canvasRef} width={400} height={400} className="border" />;
}; 