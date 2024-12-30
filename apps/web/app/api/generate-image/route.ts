import { NextResponse } from 'next/server';
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface FluxOutput {
  image: string;
}

async function streamToBlob(stream: ReadableStream): Promise<Blob> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  return new Blob(chunks, { type: 'image/png' });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Log all form data keys
    console.log('Form data keys:', Array.from(formData.keys()));
    
    const prompt = formData.get('prompt') as string;
    const style = formData.get('style') as string;
    const negativePrompt = formData.get('negativePrompt') as string;
    const colorPalette = JSON.parse(formData.get('colorPalette') as string || '[]');
    const aspectRatio = formData.get('aspectRatio') as string;
    const referenceImage = formData.get('referenceImage') as File | null;
    const drawing = formData.get('drawing') as File | null;

    // Validate required fields
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!referenceImage && !drawing) {
      return NextResponse.json({ error: 'Either a reference image or drawing is required' }, { status: 400 });
    }

    let output;

    try {
      if (drawing) {
        const drawingBuffer = await drawing.arrayBuffer();
        const drawingBase64 = Buffer.from(drawingBuffer).toString('base64');
        const drawingDataUrl = `data:${drawing.type};base64,${drawingBase64}`;

        console.log('Sending drawing to model...');
        
        output = await replicate.run(
          "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
          {
            input: {
              image: drawingDataUrl,
              scale: 9,
              prompt: `${prompt}, ${style ? `in ${style} style` : ''}, ${colorPalette.length > 0 ? `using colors: ${colorPalette.join(', ')}` : ''}`.trim(),
              a_prompt: "best quality, extremely detailed, professional",
              n_prompt: "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
              ddim_steps: 20,
              num_samples: "1",
              image_resolution: "512"
            }
          }
        );

        console.log('Drawing model output:', output);

        // Handle the output from the drawing model
        if (Array.isArray(output) && output.length > 0) {
          // Check if it's a URL string
          if (typeof output[0] === 'string' && output[0].startsWith('https://replicate.delivery')) {
            return NextResponse.json({ 
              imageUrl: output[0],
              model: "jagilley/controlnet-scribble"
            });
          }
          // Check if it's a ReadableStream (the generated image should be in output[1])
          else if (output[1] instanceof ReadableStream) {
            const blob = await streamToBlob(output[1]); // Use output[1] instead of output[0]
            const arrayBuffer = await blob.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            const dataUrl = `data:image/png;base64,${base64}`;
            
            return NextResponse.json({ 
              imageUrl: dataUrl,
              model: "jagilley/controlnet-scribble"
            });
          }
        }

        throw new Error('Model did not return a valid image output');
      } else if (referenceImage) {
        const referenceBuffer = await referenceImage.arrayBuffer();
        const referenceBase64 = Buffer.from(referenceBuffer).toString('base64');
        const referenceDataUrl = `data:${referenceImage.type};base64,${referenceBase64}`;

        console.log('Getting image description...');
        
        const description = await replicate.run(
          "yorickvp/llava-v1.6-vicuna-13b:0603dec596080fa084e26f0ae6d605fc5788ed2b1a0358cd25010619487eae63",
          {
            input: {
              image: referenceDataUrl,
              prompt: "Describe this image in detail",
              top_p: 1,
              max_tokens: 1024,
              temperature: 0.2
            }
          }
        );

        // Handle array of strings or single string description
        const processedDescription = Array.isArray(description) 
          ? description.join(' ') 
          : description;

        if (!processedDescription) {
          throw new Error('Failed to get image description');
        }

        console.log('Processed image description:', processedDescription);
        
        console.log('Generating image from description...');

        output = await replicate.run(
          "black-forest-labs/flux-1.1-pro-ultra",
          {
            input: {
              prompt: `${processedDescription}, ${prompt}, ${style ? `in ${style} style` : ''}, ${colorPalette.length > 0 ? `using colors: ${colorPalette.join(', ')}` : ''}`.trim(),
              negative_prompt: negativePrompt || "",
              aspect_ratio: aspectRatio || "1:1",
              image_prompt_strength: 0.1,
            }
          }
        );

        console.log('Reference image model output:', output);

        // Handle different types of output
        if (output instanceof ReadableStream) {
          const blob = await streamToBlob(output);
          const arrayBuffer = await blob.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const dataUrl = `data:image/png;base64,${base64}`;
          
          return NextResponse.json({ 
            imageUrl: dataUrl,
            model: "black-forest-labs/flux-1.1-pro-ultra"
          });
        } else if (typeof output === 'object' && 'image' in output) {
          const imageUrl = (output as FluxOutput).image;
          if (typeof imageUrl === 'string' && imageUrl.startsWith('https://replicate.delivery')) {
            return NextResponse.json({ 
              imageUrl,
              model: "black-forest-labs/flux-1.1-pro-ultra"
            });
          }
        }
      }

      throw new Error('Model did not return expected output format');

    } catch (modelError) {
      console.error('Model error:', modelError);
      return NextResponse.json({ 
        error: 'Error running AI model: ' + (modelError instanceof Error ? modelError.message : 'Unknown error')
      }, { status: 500 });
    }

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ 
      error: 'Server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}