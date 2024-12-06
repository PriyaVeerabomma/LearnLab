import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePodcastStore } from '@/store/podcast-store';
import { Clock, Calendar, BarChart2, PlayCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export function PodcastInfo() {
  const { currentPodcast, analytics } = usePodcastStore();

  if (!currentPodcast) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Podcast Selected</CardTitle>
          <CardDescription>
            Select a podcast to view its details
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentPodcast.title}</CardTitle>
        <CardDescription>{currentPodcast.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(currentPodcast.currentProgress)}%</span>
          </div>
          <Progress value={currentPodcast.currentProgress} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-muted">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary">Duration</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {formatDuration(currentPodcast.duration)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <PlayCircle className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary">Current Speed</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {currentPodcast.currentSpeed}x
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Learning Analytics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Time Listened</p>
                <p className="font-medium">
                  {formatDuration(analytics.totalTimeListened)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Average Speed</p>
                <p className="font-medium">{analytics.averageSpeed}x</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="font-medium">{analytics.numberOfSessions}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="font-medium">
                  {Math.round(analytics.completionRate * 100)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <Button variant="outline" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            View Learning History
          </Button>
          <Button variant="outline" className="w-full">
            <BarChart2 className="h-4 w-4 mr-2" />
            Detailed Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}