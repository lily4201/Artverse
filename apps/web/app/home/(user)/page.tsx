"use client";

import { use } from 'react';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';
import { Button } from '@kit/ui/button';
import { Plus, Download, Edit, Trash } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@kit/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// local imports
import { HomeLayoutPageHeader } from './_components/home-page-header';
import { loadUserWorkspace } from './_lib/server/load-user-workspace';

// Add language toggle component
function LanguageToggle() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="outline sm">
          EN
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>English</DropdownMenuItem>
        <DropdownMenuItem>中文</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Add ImageCard component
function ImageCard({ image }: { 
  image: {
    id: string;
    title: string;
    url: string;
    created_at: string;
    tags: string[];
  }
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <img 
          src={image.url}
          alt={image.title}
          className="w-full h-48 object-cover"
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2">{image.title}</CardTitle>
        <div className="text-sm text-muted-foreground mb-2">
          {new Date(image.created_at).toLocaleDateString()}
        </div>
        <div className="flex flex-wrap gap-1">
          {image.tags.map(tag => (
            <Badge key={tag} className="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 p-4">
        <Button className="sm ghost">
          <Edit className="h-4 w-4" />
        </Button>
        <Button className="sm ghost">
          <Download className="h-4 w-4" />
        </Button>
        <Button className="sm ghost text-destructive">
          <Trash className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// Add interface for image type
interface Image {
  id: string;
  title: string;
  url: string;
  created_at: string;
  tags: string[];
  user_id: string;
}

function UserHomePage() {
  const router = useRouter();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchImages() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const { data, error } = await supabase
          .from('images')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setImages(data || []);
      } catch (error) {
        console.error('Error fetching images:', error);
        toast.error('Failed to load images');
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [supabase]);

  const handleCreateNew = () => {
    router.push('/home/create-image');
  };

  return (
    <>
      <HomeLayoutPageHeader
        title={<Trans i18nKey={'common:routes.home'} />}
        description={<Trans i18nKey={'common:homeTabDescription'} />}
      >
        <div className="flex items-center gap-4">
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            <Trans i18nKey={'Create New'} />
          </Button>
          <LanguageToggle />
        </div>
      </HomeLayoutPageHeader>

      <PageBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map(image => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      </PageBody>
    </>
  );
}

export default UserHomePage;