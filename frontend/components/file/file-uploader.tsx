'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { useFileStore } from '@/store/file-store';
import { useToast } from '@/hooks/use-toast';

export function FileUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const addFile = useFileStore((state) => state.addFile);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      addFile(data);
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload file",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [addFile, toast]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    multiple: false,
  });

  return (
    <Card
      className="relative border-2 border-dashed"
      {...getRootProps()}
    >
      <div className="p-6 flex flex-col items-center justify-center space-y-4">
        <input {...getInputProps()} />
        <div className="rounded-full p-3 bg-primary/10">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">
            {isDragActive ? "Drop the file here" : "Upload a file"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop your file here or click to browse
          </p>
        </div>
        <Button
          onClick={open}
          variant="outline"
          disabled={uploading}
        >
          Choose File
        </Button>
        {uploading && (
          <div className="w-full space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              Uploading... {progress}%
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}