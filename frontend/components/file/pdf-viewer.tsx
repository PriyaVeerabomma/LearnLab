// components/file/pdf-viewer.tsx
'use client';

import { PdfLoader, PdfHighlighter } from 'react-pdf-highlighter';
import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { FileResponse } from '@/types/file';
import { Skeleton } from '@/components/ui/skeleton';
import "react-pdf-highlighter/dist/style.css";
interface PDFViewerProps {
  file: FileResponse;
}

export function PDFViewer({ file }: PDFViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use useEffect to handle mounting state
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const LoadingFallback = useCallback(() => (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  ), []);

  if (!mounted) {
    return <LoadingFallback />;
  }

  if (!file || !file.download_url) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No file selected
      </div>
    );
  }

  return (
    <Card className="w-full h-[calc(100vh-12rem)] relative overflow-hidden">
      {/* Download Button */}
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-10"
        onClick={() => window.open(file.download_url, '_blank')}
      >
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>

      {/* PDF Viewer Container */}
      <div className="absolute inset-0 pt-16">
        {error ? (
          <div className="flex items-center justify-center h-full text-destructive">
            {error}
          </div>
        ) : (
          <PdfLoader 
            url={file.download_url} 
            beforeLoad={<LoadingFallback />}
            onError={(err) => setError('Failed to load PDF file')}
          >
            {(pdfDocument) => (
              <div style={{ height: "100%" }}>
                <PdfHighlighter
                  pdfDocument={pdfDocument}                  
                  onScrollChange={() => {}}
                  highlightTransform={() => null}
                  highlights={[]}
                />
              </div>
            )}
          </PdfLoader>
        )}
      </div>
    </Card>
  );
}