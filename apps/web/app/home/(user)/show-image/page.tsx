"use client";

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@kit/ui/card";
import { Button } from "@kit/ui/button";
import Image from 'next/image';
import Link from 'next/link';

export default function ShowImagePage() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('url');
  const isLoading = searchParams.get('loading') === 'true';

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!imageUrl) {
    return <div>No image URL provided</div>;
  }

  return (
    <div className="p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Generated Image</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="relative w-full aspect-square">
            <Image
              src={imageUrl}
              alt="Generated Image"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <Button asChild>
            <Link href="/ai-image-generator">Generate Another Image</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

