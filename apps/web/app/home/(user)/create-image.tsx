import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { FileUpload } from './prompt/file-upload';
import { ColorPalettePicker } from './prompt/color-palette-picker';
import { SketchPad } from './prompt/sketch-pad';

function CreateImagePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [artStyle, setArtStyle] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState('');

  const handleSubmit = () => {
    // Handle form submission logic here
    console.log({
      prompt,
      artStyle,
      negativePrompt,
      referenceImage,
      colorPalette,
      aspectRatio,
    });
    // Navigate back to the gallery or another page after submission
    router.push('/home');
  };

  return (
    <div className="p-4">
      <h1>Create AI Image</h1>
      <div className="mb-4">
        <label>
          Prompt Description
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </label>
      </div>
      <div className="mb-4">
        <label>
          Art Style
          <select
            value={artStyle}
            onChange={(e) => setArtStyle(e.target.value)}
          >
            <option value="style1">Style 1</option>
            <option value="style2">Style 2</option>
            {/* Add more styles */}
          </select>
        </label>
      </div>
      <div className="mb-4">
        <label>
          Negative Prompt
          <Textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
          />
        </label>
      </div>
      <div className="mb-4">
        <FileUpload
          label="Upload Reference"
          onChange={(file) => setReferenceImage(file)}
        />
        <SketchPad onDraw={(data) => console.log(data)} />
      </div>
      <div className="mb-4">
        <ColorPalettePicker
          selectedPalette={colorPalette}
          onChange={(palette) => setColorPalette(palette)}
        />
      </div>
      <div className="mb-4">
        <label>
          Dimension/Aspect Ratio
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
          >
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
            {/* Add more aspect ratios */}
          </select>
        </label>
      </div>
      <Button onClick={handleSubmit}>Generate Image</Button>
    </div>
  );
}

export default CreateImagePage; 