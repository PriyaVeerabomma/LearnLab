'use client';

import { useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePodcastStore } from '@/store/podcast-store';
import { Play, Pause, Clock, BarChart } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from 'date-fns';
import { fetchClient } from '@/lib/api/fetch-client';
import { API_ROUTES } from '@/config';
import { useRouter } from 'next/navigation';

export function PodcastGrid() {
  const { toast } = useToast();
  const { 
    podcasts, 
    setPodcasts, 
    currentPodcast,
    setCurrentPodcast,
    isPlaying,
    setIsPlaying 
  } = usePodcastStore();
  const router = useRouter();

  // Fetch podcasts on mount
  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const response = await fetchClient(`${API_ROUTES.podcasts.base}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth');
            return;
          }
          throw new Error('Failed to fetch podcasts');
        }
        
        const data = await response.json();
        setPodcasts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch podcasts:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load podcasts",
        });
        // Initialize with empty array if fetch fails
        setPodcasts([]);
      }
    };

    fetchPodcasts();
  }, [setPodcasts, toast, router]);

  const handlePlayPause = (podcast: any) => {
    if (currentPodcast?.id === podcast.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPodcast(podcast);
      setIsPlaying(true);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // Guard against podcasts being undefined or null
  if (!podcasts) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Loading podcasts...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.isArray(podcasts) && podcasts.length > 0 ? (
        podcasts.map((podcast) => (
          <Card key={podcast.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg line-clamp-1">{podcast.title}</CardTitle>
              {podcast.description && (
                <CardDescription className="line-clamp-2">
                  {podcast.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatDuration(podcast.duration)}
                </div>
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  {`${Math.round(podcast.current_progress)}% Complete`}
                </div>
              </div>

              <Progress 
                value={podcast.current_progress} 
                className="h-2"
              />

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handlePlayPause(podcast)}
              >
                {currentPodcast?.id === podcast.id && isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-full flex items-center justify-center p-8 text-muted-foreground">
          No podcasts found. Upload a podcast to get started.
        </div>
      )}
    </div>
  );
}