'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Music, FileText } from 'lucide-react';
import { usePodcastStore } from '@/store/podcast-store';
import { useFileStore } from '@/store/file-store';
import { useRouter } from 'next/navigation';
import { fetchClient } from '@/lib/api/fetch-client';
import { API_ROUTES } from '@/config';

export function PodcastUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const { toast } = useToast();
  const setPodcasts = usePodcastStore((state) => state.setPodcasts);
  const { files, setFiles } = useFileStore();
  const router = useRouter();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetchClient(`${API_ROUTES.files.list}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth');
            return;
          }
          throw new Error('Failed to fetch files');
        }
        
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch source files",
        });
      }
    };

    fetchFiles();
  }, [setFiles, toast, router]);

  const onAudioDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setAudioFile(file);
  }, []);

  const onTranscriptDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setTranscriptFile(file);
  }, []);

  const { getRootProps: getAudioRootProps, getInputProps: getAudioInputProps } = useDropzone({
    onDrop: onAudioDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    multiple: false,
    disabled: uploading
  });

  const { getRootProps: getTranscriptRootProps, getInputProps: getTranscriptInputProps } = useDropzone({
    onDrop: onTranscriptDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/vtt': ['.vtt']
    },
    multiple: false,
    disabled: uploading
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !audioFile || !transcriptFile || !selectedFileId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide all required fields including source file",
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Create form data with all required fields
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description || '');
      formData.append('file_id', selectedFileId);
      formData.append('audio_file', audioFile);
      formData.append('transcript_file', transcriptFile);

      const response = await fetchClient(`${API_ROUTES.podcasts.base}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create podcast');
      }

      const data = await response.json();
      setPodcasts((prev) => [...prev, data]);
      setProgress(100);

      toast({
        title: "Success",
        description: "Podcast created successfully",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setAudioFile(null);
      setTranscriptFile(null);
      setSelectedFileId(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create podcast",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Upload New Podcast</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Selection */}
          <div className="space-y-2">
            <Label>Source File</Label>
            <Select
              value={selectedFileId || ""}
              onValueChange={(value) => setSelectedFileId(value)}
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source file" />
              </SelectTrigger>
              <SelectContent>
                {files.map((file) => (
                  <SelectItem
                    key={file.id}
                    value={file.id}
                    className="cursor-pointer"
                  >
                    {file.filename}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Select the PDF file to associate with this podcast
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
              placeholder="Enter podcast title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              placeholder="Enter podcast description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audio Upload */}
            <div>
              <Label>Audio File</Label>
              <div 
                {...getAudioRootProps()} 
                className={`
                  mt-2 border-2 border-dashed rounded-lg p-6 
                  cursor-pointer transition-colors
                  ${audioFile ? 'border-primary bg-primary/5' : 'border-border'}
                  ${uploading ? 'cursor-not-allowed opacity-50' : 'hover:border-primary/50'}
                `}
              >
                <input {...getAudioInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  <Music className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    {audioFile ? (
                      <p>{audioFile.name}</p>
                    ) : (
                      <p>Drop audio file or click to select</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript Upload */}
            <div>
              <Label>Transcript File</Label>
              <div 
                {...getTranscriptRootProps()} 
                className={`
                  mt-2 border-2 border-dashed rounded-lg p-6 
                  cursor-pointer transition-colors
                  ${transcriptFile ? 'border-primary bg-primary/5' : 'border-border'}
                  ${uploading ? 'cursor-not-allowed opacity-50' : 'hover:border-primary/50'}
                `}
              >
                <input {...getTranscriptInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    {transcriptFile ? (
                      <p>{transcriptFile.name}</p>
                    ) : (
                      <p>Drop transcript file (.txt or .vtt) or click to select</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Uploading... {progress}%
              </p>
            </div>
          )}

          <Button 
            type="submit"
            className="w-full" 
            disabled={!title || !audioFile || !transcriptFile || !selectedFileId || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Podcast'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}