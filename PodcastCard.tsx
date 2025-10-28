import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Play, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PodcastCardProps {
  id: string;
  topic: string;
  subject: string;
  createdAt: string;
  isFavorite: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
}

export function PodcastCard({ 
  topic, 
  subject, 
  createdAt, 
  isFavorite, 
  onPlay, 
  onToggleFavorite 
}: PodcastCardProps) {
  return (
    <Card className="bg-gradient-card border-border hover:shadow-glow-soft transition-all">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-foreground line-clamp-1">{topic}</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {subject} • {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </CardDescription>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleFavorite}
            className="shrink-0"
          >
            <Heart 
              className={`h-4 w-4 ${isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
            />
          </Button>
        </div>
        <Button 
          onClick={onPlay}
          className="w-full mt-4 shadow-glow-soft"
        >
          <Play className="h-4 w-4 mr-2" />
          Listen Now
        </Button>
      </CardHeader>
    </Card>
  );
}
