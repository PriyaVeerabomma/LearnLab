import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePodcastStore } from '@/store/podcast-store';
import { Play, Pause, Clock, BarChart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function PodcastList() {
  const { 
    podcasts, 
    currentPodcast,
    setCurrentPodcast,
    isPlaying,
    setIsPlaying 
  } = usePodcastStore();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const handlePlayPause = (podcast: any) => {
    if (currentPodcast?.id === podcast.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPodcast(podcast);
      setIsPlaying(true);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Last Played</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {podcasts.map((podcast) => (
            <TableRow key={podcast.id}>
              <TableCell>
                {currentPodcast?.id === podcast.id && isPlaying ? (
                  <div className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs">
                    Playing
                  </div>
                ) : podcast.currentProgress > 0 ? (
                  <div className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs">
                    In Progress
                  </div>
                ) : (
                  <div className="bg-accent/10 text-accent rounded-md px-2 py-1 text-xs">
                    New
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{podcast.title}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDuration(podcast.duration)}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Progress 
                    value={podcast.currentProgress} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(podcast.currentProgress)}% Complete
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {podcast.lastPlayedAt ? (
                  formatDistanceToNow(new Date(podcast.lastPlayedAt), { addSuffix: true })
                ) : (
                  "Never played"
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePlayPause(podcast)}
                >
                  {currentPodcast?.id === podcast.id && isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {podcasts.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No podcasts found. Upload a PDF to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}