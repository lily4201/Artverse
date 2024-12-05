import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Check API key first
  const apiKey = process.env.STARRYAI_API_KEY;
  if (!apiKey) {
    console.error('StarryAI API key is not configured');
    return NextResponse.json(
      { error: 'API configuration error' },
      { status: 500 }
    );
  }

  try {
    const { prompt, style, negativePrompt, colorPalette } = await request.json();
    
    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Construct the enhanced prompt with style and colors
    const enhancedPrompt = [
      prompt.trim(),
      style ? `in ${style} style` : '',
      colorPalette?.length ? `using the following colors: ${colorPalette.join(', ')}` : ''
    ].filter(Boolean).join(', ');

    // First request to create the image generation task
    const createResponse = await fetch('https://api.starryai.com/creations/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'accept': 'application/json'
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        negativePrompt: negativePrompt?.trim() || undefined,
        model: 'lyra',
        aspectRatio: 'square',
        highResolution: false,
        images: 1,
        steps: 20,
        initialImageMode: 'color'
      })
    });

    // Handle authorization errors specifically
    if (createResponse.status === 401) {
      console.error('StarryAI API authorization failed');
      return NextResponse.json(
        { error: 'API authorization failed' },
        { status: 401 }
      );
    }

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('StarryAI create error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to create image generation task' },
        { status: createResponse.status }
      );
    }

    const createData = await createResponse.json();
    console.log('Creation response:', createData);

    if (!createData.id) {
      throw new Error('No creation ID received from StarryAI');
    }

    // Poll for the result
    let attempts = 0;
    const maxAttempts = 30;
    let imageUrl = null;

    while (attempts < maxAttempts && !imageUrl) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      
      const checkResponse = await fetch(`https://api.starryai.com/creations/${createData.id}`, {
        headers: {
          'X-API-Key': apiKey,
          'accept': 'application/json'
        }
      });

      if (!checkResponse.ok) {
        const errorData = await checkResponse.json();
        console.error('StarryAI fetch error:', errorData);
        throw new Error(`StarryAI fetch failed: ${errorData.message || checkResponse.statusText}`);
      }

      const result = await checkResponse.json();
      console.log('Poll response:', result);
      
      if (result.status === 'completed' && result.images && result.images.length > 0) {
        imageUrl = result.images[0].url;
        console.log('Image URL found:', imageUrl);
        break;
      } else if (result.status === 'failed') {
        console.error('Generation failed:', result);
        throw new Error('Image generation failed');
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before next attempt
    }

    if (!imageUrl) {
      throw new Error('Timeout waiting for image generation');
    }

    return NextResponse.json({ 
      imageUrl,
      message: 'Image generated successfully'
    });
  } catch (error) {
    console.error('StarryAI API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate image',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 