import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const formData = await req.formData();
    const prompt = formData.get('prompt');
    const style = formData.get('style');
    const negativePrompt = formData.get('negativePrompt');
    const colorPalette = formData.get('colorPalette') ? JSON.parse(formData.get('colorPalette')) : null;
    const aspectRatio = formData.get('aspectRatio');
    const referenceImage = formData.get('referenceImage');
    const drawing = formData.get('drawing');

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    let output;

    if (drawing) {
      output = await replicate.run(
        "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
        {
          input: {
            image: drawing,
            prompt: `${prompt}, ${style ? `in ${style} style` : ''}, ${colorPalette ? `using colors: ${colorPalette.join(', ')}` : ''}`.trim(),
            negative_prompt: negativePrompt,
            num_samples: "1",
            image_resolution: "512",
            scale: 9,
            a_prompt: "best quality, extremely detailed",
            n_prompt: "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
          }
        }
      );
    } else if (referenceImage) {
      const description = await replicate.run(
        "yorickvp/llava-v1.6-vicuna-13b:0603dec596080fa084e26f0ae6d605fc5788ed2b1a0358cd25010619487eae63",
        {
          input: {
            image: referenceImage,
            prompt: "Describe this image in detail",
            top_p: 1,
            max_tokens: 1024,
            temperature: 0.2
          }
        }
      );

      output = await replicate.run(
        "black-forest-labs/flux-1.1-pro-ultra",
        {
          input: {
            prompt: `${description}, ${prompt}, ${style ? `in ${style} style` : ''}, ${colorPalette ? `using colors: ${colorPalette.join(', ')}` : ''}`.trim(),
            negative_prompt: negativePrompt,
            aspect_ratio: aspectRatio || "1:1",
            image_prompt_strength: 0.1,
          }
        }
      );
    } else {
      throw new Error('No valid input provided');
    }

    if (Array.isArray(output) && output.length > 0 && typeof output[0] === 'string') {
      return NextResponse.json({ imageUrl: output[0] });
    } else {
      console.error('Unexpected output format:', output);
      throw new Error('No valid image URL generated');
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
} 