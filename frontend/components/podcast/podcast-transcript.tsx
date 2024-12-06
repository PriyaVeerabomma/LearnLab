import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePodcastStore } from '@/store/podcast-store';
import { Search, Clock } from 'lucide-react';

interface TranscriptLine {
  startTime: number;
  endTime: number;
  text: string;
}

export function PodcastTranscript() {
  const { currentPodcast, currentTime, setCurrentTime } = usePodcastStore();
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const activeLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTranscript = async () => {
      if (!currentPodcast) return;
      
      setLoading(true);
      try {
        // Try VTT first, fall back to TXT
        const url = currentPodcast.transcriptVttUrl || currentPodcast.transcriptTxtUrl;
        const response = await fetch(url);
        const text = await response.text();
        
        const lines = url.endsWith('.vtt') 
          ? parseVTT(text)
          : parseTextTranscript(text);
        
        setTranscript(lines);
      } catch (error) {
        console.error('Failed to load transcript:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscript();
  }, [currentPodcast]);

  // Parse WebVTT format
  const parseVTT = (vttText: string): TranscriptLine[] => {
    const lines: TranscriptLine[] = [];
    const cues = vttText.split('\n\n').slice(1); // Skip WEBVTT header

    cues.forEach(cue => {
      const [timing, ...textLines] = cue.split('\n');
      if (!timing) return;

      const [timeRange] = timing.split(' --> ');
      const [startTimeStr, endTimeStr] = timing.split(' --> ');
      
      if (!startTimeStr || !endTimeStr) return;

      const startTime = timeToSeconds(startTimeStr.trim());
      const endTime = timeToSeconds(endTimeStr.trim());
      const text = textLines.join(' ').trim();

      if (text) {
        lines.push({ startTime, endTime, text });
      }
    });

    return lines;
  };

  // Parse plain text format
  const parseTextTranscript = (text: string): TranscriptLine[] => {
    // Split by paragraphs or sentences
    const segments = text.split(/\n\n|\.\s+/);
    const avgDuration = currentPodcast?.duration 
      ? currentPodcast.duration / segments.length 
      : 30;

    return segments.map((segment, index) => ({
      startTime: index * avgDuration,
      endTime: (index + 1) * avgDuration,
      text: segment.trim()
    }));
  };

  // Convert VTT timestamp to seconds
  const timeToSeconds = (timeStr: string): number => {
    const [hours, minutes, secondsMs] = timeStr.split(':');
    const [seconds, ms] = secondsMs.split('.');
    return (
      parseInt(hours) * 3600 +
      parseInt(minutes) * 60 +
      parseInt(seconds) +
      (ms ? parseInt(ms) / 1000 : 0)
    );
  };

  // Format seconds to timestamp
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filter and highlight search results
  const filteredTranscript = transcript.filter(line => 
    line.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle line click to seek audio
  const handleLineClick = (startTime: number) => {
    setCurrentTime(startTime);
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle>Transcript</CardTitle>
        <div className="flex gap-2">
          <Input
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading transcript...
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {filteredTranscript.map((line, index) => {
                const isActive = 
                  currentTime >= line.startTime && 
                  currentTime <= line.endTime;

                return (
                  <div
                    key={index}
                    ref={isActive ? activeLineRef : null}
                    className={`
                      p-3 rounded-md cursor-pointer transition-colors
                      ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}
                    `}
                    onClick={() => handleLineClick(line.startTime)}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(line.startTime)}
                    </div>
                    <p className="text-sm leading-relaxed">{line.text}</p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}