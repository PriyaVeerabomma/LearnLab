import { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { usePodcastStore } from '@/store/podcast-store';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Volume1, 
  VolumeX,
  Settings,
} from 'lucide-react';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function PodcastPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<NodeJS.Timeout>();

  const { 
    currentPodcast,
    isPlaying,
    currentTime,
    volume,
    playbackRate,
    setIsPlaying,
    setCurrentTime,
    setVolume,
    setPlaybackRate,
    updateProgress
  } = usePodcastStore();

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentPodcast) return;

    // Set initial values
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    audio.currentTime = currentTime;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    // Cleanup
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentPodcast, volume, playbackRate, setCurrentTime, setIsPlaying]);

  // Handle progress updates
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        const audio = audioRef.current;
        if (audio && currentPodcast) {
          const progress = (audio.currentTime / audio.duration) * 100;
          updateProgress({ 
            currentPosition: audio.currentTime,
            completionPercentage: progress 
          });
        }
      }, 15000); // Update every 15 seconds
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, currentPodcast, updateProgress]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const value = newVolume[0];
    const audio = audioRef.current;
    if (!audio) return;

    const normalizedVolume = value / 100;
    audio.volume = normalizedVolume;
    setVolume(normalizedVolume);
  };

  const handleSpeedChange = (speed: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = speed;
    setPlaybackRate(speed);
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentPodcast) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        {/* Hidden audio element */}
        <audio 
          ref={audioRef} 
          src={currentPodcast.s3_audio_key} 
          preload="metadata"
        />

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress 
            value={(currentTime / currentPodcast.duration) * 100} 
            className="h-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentPodcast.duration)}</span>
          </div>
        </div>

        {/* Main controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => skipTime(-10)}
          >
            <SkipBack className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => skipTime(10)}
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Additional controls */}
        <div className="flex items-center gap-4">
          {/* Volume control */}
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleVolumeChange(volume === 0 ? [100] : [0])}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : volume < 0.5 ? (
                <Volume1 className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              className="w-24"
              onValueChange={handleVolumeChange}
            />
          </div>

          {/* Speed control */}
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <select
              value={playbackRate}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="bg-background text-sm p-1 rounded border"
            >
              {SPEED_OPTIONS.map((speed) => (
                <option key={speed} value={speed}>
                  {speed}x
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}