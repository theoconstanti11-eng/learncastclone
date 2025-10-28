import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Headphones, ArrowLeft, Share2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { StudyCastAppShell } from '@/components/layouts/StudyCastAppShell';

interface Podcast {
  id: string;
  subject: string;
  topic: string;
  audio_url: string | null;
  duration: number | null;
  created_at: string;
}

const MyPodcasts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadPodcasts = async () => {
      try {
        const { data, error } = await supabase
          .from('podcasts')
          .select('id, subject, topic, audio_url, duration, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPodcasts(data || []);
      } catch (error) {
        console.error('Failed to load podcasts:', error);
        toast.error('Unable to load your podcasts right now.');
      } finally {
        setLoading(false);
      }
    };

    loadPodcasts();
  }, [user, navigate]);

  const sources = useMemo(() => {
    const sourceSet = new Set<string>();
    podcasts.forEach((podcast) => {
      const inferredSource = podcast.topic.includes(' - ') ? 'Textbook' : 'Custom Topic';
      sourceSet.add(inferredSource);
    });
    return Array.from(sourceSet);
  }, [podcasts]);

  const subjects = useMemo(() => {
    const subjectSet = new Set<string>();
    podcasts.forEach((podcast) => subjectSet.add(podcast.subject));
    return Array.from(subjectSet);
  }, [podcasts]);

  const filteredPodcasts = useMemo(() => {
    return podcasts.filter((podcast) => {
      const inferredSource = podcast.topic.includes(' - ') ? 'Textbook' : 'Custom Topic';
      const matchesSubject = subjectFilter === 'all' || podcast.subject === subjectFilter;
      const matchesSource = sourceFilter === 'all' || inferredSource === sourceFilter;
      return matchesSubject && matchesSource;
    });
  }, [podcasts, subjectFilter, sourceFilter]);

  const handleShare = async (podcast: Podcast) => {
    const shareData = {
      title: `StudyCast — ${podcast.topic}`,
      text: `I just generated a StudyCast episode on ${podcast.topic}. Listen along!`,
      url: window.location.origin + `/listen/${podcast.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Share link opened!');
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
          toast.error('Unable to share right now.');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      toast.success('Link copied to clipboard');
    }
  };

  const handleDownload = (podcast: Podcast) => {
    if (!podcast.audio_url) {
      toast.error('No audio available to download yet.');
      return;
    }

    const link = document.createElement('a');
    link.href = podcast.audio_url;
    link.download = `${podcast.topic.replace(/\s+/g, '-').toLowerCase()}.mp3`;
    link.click();
    toast.success('Download starting...');
  };

  return (
    <StudyCastAppShell>
      <header className="border-b border-white/25 bg-white/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="rounded-full border border-white/40 bg-white/50 text-slate-800 transition hover:bg-white/70"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-white/40 bg-white/60 p-2 shadow-sm">
              <Headphones className="h-5 w-5 text-indigo-500" />
            </div>
            <span className="text-lg font-semibold tracking-wide text-slate-900">My StudyCasts</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">My Podcasts</h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
              Revisit everything you've generated. Filter by subject, textbook or share your favourites.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/30 bg-white/60 p-12 text-center text-slate-700 shadow-lg backdrop-blur-xl">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/40 border-t-indigo-500" />
              <p className="mt-4 text-sm">Fetching your learning library...</p>
            </div>
          ) : podcasts.length === 0 ? (
            <Card className="rounded-3xl border border-white/30 bg-white/80 py-16 text-center shadow-xl shadow-indigo-500/10 backdrop-blur-xl">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/40 bg-white/70">
                  <Headphones className="h-8 w-8 text-indigo-500" />
                </div>
                <CardTitle className="mt-6 text-2xl font-semibold text-slate-900">No podcasts yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-sm text-slate-600">
                  Generate your first episode to start filling your StudyCast library.
                </p>
                <Button onClick={() => navigate('/generate')} className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 px-6 py-3 text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-90">
                  Generate Podcast 🎧
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="rounded-2xl border border-white/30 bg-white/70 text-slate-800 backdrop-blur-xl">
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="rounded-2xl border border-white/30 bg-white/70 text-slate-800 backdrop-blur-xl">
                    <SelectValue placeholder="Filter by source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sources</SelectItem>
                    {sources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSubjectFilter('all');
                    setSourceFilter('all');
                  }}
                  className="rounded-2xl border border-white/40 bg-white/40 text-slate-800 transition hover:bg-white/60"
                >
                  Reset filters
                </Button>
              </div>

              <div className="space-y-8">
                {filteredPodcasts.map((podcast) => {
                  const inferredSource = podcast.topic.includes(' - ') ? 'Textbook' : 'Custom Topic';
                  const durationMinutes = podcast.duration ? Math.round(podcast.duration / 60) : null;

                  return (
                    <Card key={podcast.id} className="overflow-hidden rounded-3xl border border-white/30 bg-white/80 shadow-xl shadow-indigo-500/10 backdrop-blur-xl">
                      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle className="mb-2 text-2xl font-semibold text-slate-900">
                            {podcast.topic}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            <Badge variant="secondary" className="rounded-full bg-indigo-100 text-indigo-700">
                              {podcast.subject}
                            </Badge>
                            <Badge variant="outline" className="rounded-full border-indigo-200 text-indigo-600">
                              {inferredSource}
                            </Badge>
                            {durationMinutes ? <span>~{durationMinutes} min listen</span> : null}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare(podcast)}
                            className="rounded-full border border-white/40 bg-white/40 text-slate-800 hover:bg-white/60"
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDownload(podcast)}
                            className="rounded-full bg-indigo-500/80 text-white hover:bg-indigo-500"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {podcast.audio_url ? (
                          <AudioPlayer
                            audioUrl={podcast.audio_url}
                            title={podcast.topic}
                            subject={`${podcast.subject} • Saved ${new Date(podcast.created_at).toLocaleDateString()}`}
                          />
                        ) : (
                          <div className="rounded-2xl border border-dashed border-white/50 bg-white/60 p-6 text-center text-slate-600">
                            Audio is still processing — check back in a moment.
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                          <span>Created {new Date(podcast.created_at).toLocaleString()}</span>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => navigate(`/listen/${podcast.id}`)}
                            className="px-0 text-indigo-600"
                          >
                            Open full transcript →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {filteredPodcasts.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/50 bg-white/50 p-10 text-center text-slate-600 backdrop-blur-xl">
                    <p className="mb-4 text-sm">No podcasts match your filters.</p>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSubjectFilter('all');
                        setSourceFilter('all');
                      }}
                      className="rounded-full bg-indigo-500/80 text-white hover:bg-indigo-500"
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </StudyCastAppShell>
  );
};

export default MyPodcasts;
