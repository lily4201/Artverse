"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Paintbrush, Upload, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@kit/ui/card";
import { Input } from "@kit/ui/input";
import { Label } from "@kit/ui/label";
import { Textarea } from "@kit/ui/textarea";
import { Button } from "@kit/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@kit/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kit/ui/tabs";
import { Switch } from "@kit/ui/switch";
import { ColorPalette } from "./components/color-palette-picker";
import { Canvas } from "./components/sketch-pad";

const artStyles = [
  "Realistic", "Abstract", "Impressionist", "Surrealist", "Pop Art",
  "Minimalist", "Cubist", "Art Nouveau", "Digital Art", "Pixel Art",
  "Van Gogh", "Picasso", "Monet", "Da Vinci", "Banksy"
];

const aspectRatios = [
  { label: "1:1 (Square)", value: "1:1", width: 100, height: 100 },
  { label: "4:3", value: "4:3", width: 100, height: 75 },
  { label: "16:9", value: "16:9", width: 100, height: 56.25 },
  { label: "3:2", value: "3:2", width: 100, height: 66.67 },
  { label: "2:1", value: "2:1", width: 100, height: 50 }
];

function AIImageGenerator() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [artStyle, setArtStyle] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [referenceMethod, setReferenceMethod] = useState("upload");
  const [colorPalette, setColorPalette] = useState<string[]>(["#FF0000", "#00FF00", "#0000FF"]);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [customPalette, setCustomPalette] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layer, setLayer] = useState("1");

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const getCanvasDataUrl = async (): Promise<string | undefined> => {
    const canvas = document.querySelector('canvas');
    return canvas?.toDataURL('image/png');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (!prompt.trim()) {
        setError('Please enter a prompt description');
        return;
      }

      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('style', artStyle);
      formData.append('negativePrompt', negativePrompt);
      
      if (customPalette && colorPalette.length > 0) {
        formData.append('colorPalette', JSON.stringify(colorPalette));
      }
      
      formData.append('aspectRatio', aspectRatio);

      // Add reference image if selected and in upload mode
      if (referenceMethod === 'upload' && selectedFile) {
        formData.append('referenceImage', selectedFile);
      }

      // Add drawing if in draw mode
      if (referenceMethod === 'draw') {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          // Convert canvas to blob
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
            }, 'image/png');
          });
          formData.append('drawing', blob, 'drawing.png');
        }
      }

      // Log what we're sending
      console.log('Sending form data:', {
        prompt,
        style: artStyle,
        negativePrompt,
        aspectRatio,
        hasReferenceImage: referenceMethod === 'upload' && !!selectedFile,
        hasDrawing: referenceMethod === 'draw',
        method: referenceMethod
      });

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (!data.imageUrl) {
        throw new Error('No image URL received');
      }

      localStorage.setItem('generatedImageUrl', data.imageUrl);
      router.push('/home/image/show-image');
      
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const selectedRatio = aspectRatios.find(ratio => ratio.value === aspectRatio);

  return (
    <div className="p-4">
      <Button className="outline" onClick={() => router.push('/home')}>
        Back
      </Button>
      <Card className="w-full max-w-4xl mx-auto mt-4">
        <CardHeader>
          <CardTitle>AI Image Generator</CardTitle>
          <CardDescription>Create unique AI-generated images with custom parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt Description</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artStyle">Art Style</Label>
              <Select value={artStyle} onValueChange={setArtStyle}>
                <SelectTrigger id="artStyle">
                  <SelectValue placeholder="Select an art style" />
                </SelectTrigger>
                <SelectContent>
                  {artStyles.map((style) => (
                    <SelectItem key={style} value={style.toLowerCase()}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="negativePrompt">Negative Prompt</Label>
              <Input
                id="negativePrompt"
                placeholder="Elements to exclude from the image..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Reference Image</Label>
              <Tabs value={referenceMethod} onValueChange={setReferenceMethod}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" /> Upload</TabsTrigger>
                  <TabsTrigger value="draw"><Paintbrush className="mr-2 h-4 w-4" /> Draw</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    <div className="flex flex-col items-center gap-2 text-center">
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your image here, or click to select
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports PNG, JPG up to 5MB
                      </p>
                    </div>
                    <Input
                      id="picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      className="outline"
                      onClick={() => document.getElementById('picture')?.click()}
                    >
                      Choose File
                    </Button>
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="draw">
                  <Canvas />
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="colorPalette">Color Palette</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="custom-palette"
                    checked={customPalette}
                    onCheckedChange={setCustomPalette}
                  />
                  <Label htmlFor="custom-palette">Custom</Label>
                </div>
              </div>
              <ColorPalette
                selectedColors={colorPalette}
                onSelectColor={setColorPalette}
                custom={customPalette}
                onToggleCustom={setCustomPalette}
              />
              <div className="flex justify-center mt-2 p-2 border rounded-lg">
                <div className="flex space-x-2">
                  {colorPalette.map((color, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspectRatio">Dimension/Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger id="aspectRatio">
                  <SelectValue placeholder="Select an aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatios.map((ratio) => (
                    <SelectItem key={ratio.value} value={ratio.value}>
                      {ratio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRatio && (
                <div className="flex items-center justify-center p-4 border rounded-lg">
                  <div
                    className="bg-muted"
                    style={{
                      width: `${selectedRatio.width}px`,
                      height: `${selectedRatio.height}px`,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="layer">Select Layer</Label>
              <Select value={layer} onValueChange={setLayer}>
                <SelectTrigger id="layer">
                  <SelectValue placeholder="Select a layer" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].map((layerNumber) => (
                    <SelectItem key={layerNumber} value={layerNumber.toString()}>
                      {layerNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⭮</span>
                  Generating Image...
                </>
              ) : (
                'Generate Image'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIImageGenerator;