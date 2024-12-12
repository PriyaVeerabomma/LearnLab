'use client';

import { useEffect } from 'react';
import { useFileStore } from '@/store/file-store';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { fetchClient } from '@/lib/api/fetch-client';
import { API_ROUTES } from '@/config';

export default function FileLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { fileId: string };
}) {
  const { toast } = useToast();
  const router = useRouter();
  const { selectedFile, setSelectedFile } = useFileStore();

  useEffect(() => {
    // Fetch file details if not already in store
    const fetchFile = async () => {
      try {
        const response = await fetchClient(API_ROUTES.files.get(params.fileId));
        
        if (!response.ok) {
          if (response.status === 404) {
            toast({
              title: "File not found",
              description: "The requested file could not be found.",
              variant: "destructive"
            });
            router.push('/dashboard');
            return;
          }
          throw new Error('Failed to fetch file');
        }

        const file = await response.json();
        setSelectedFile(file);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load file details",
          variant: "destructive"
        });
        router.push('/dashboard');
      }
    };

    if (!selectedFile || selectedFile.id !== params.fileId) {
      fetchFile();
    }
  }, [params.fileId, selectedFile, setSelectedFile, router, toast]);

  if (!selectedFile) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}