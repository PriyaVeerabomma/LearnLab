import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from 'lucide-react';
import { PodcastGrid } from './podcast-grid';
import { PodcastList } from './podcast-list';

export function PodcastViewer() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? <PodcastGrid /> : <PodcastList />}
    </div>
  );
}