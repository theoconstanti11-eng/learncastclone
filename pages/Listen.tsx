import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '@/components/AudioPlayer';
import { supabase } from '@/integrations/supabase/client';
import { Headphones, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { StudyCastAppShell } from '@/components/layouts/StudyCastAppShell';

interface Podcast {
  id: string;
  subject: string;
  topic: string;
  content: string;
  audio_url: string | null;
  created_at: string;
}

const Listen = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (id) loadPodcast(id);
  }, [id, user, navigate]);

  const loadPodcast = async (podcastId: string) => {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .eq('id', podcastId)
        .single();

      if (error) throw error;
      setPodcast(data);
    } catch (error: any) {
      toast.error('Failed to load podcast');
      console.error(error);
      navigate('/my-podcasts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudyCastAppShell className="items-center justify-center">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-slate-800">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/40 border-t-indigo-500"></div>
            <p className="mt-4 text-sm text-slate-700">Loading podcast...</p>
          </div>
        </div>
      </StudyCastAppShell>
    );
  }

  if (!podcast) return null;

  return (
    <StudyCastAppShell>
      <header className="border-b border-white/25 bg-white/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4 sm:px-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/my-podcasts')}
            className="rounded-full border border-white/40 bg-white/50 text-slate-800 hover:bg-white/70"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-white/40 bg-white/60 p-2 shadow-sm">
              <Headphones className="h-5 w-5 text-indigo-500" />
            </div>
            <span className="text-lg font-semibold tracking-wide text-slate-900">StudyCast Player</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {podcast.audio_url && (
            <AudioPlayer audioUrl={podcast.audio_url} title={podcast.topic} subject={podcast.subject} />
          )}

          <Card className="rounded-3xl border border-white/30 bg-white/80 shadow-xl shadow-indigo-500/10 backdrop-blur-xl">
            <CardContent className="p-8">
              <h2 className="mb-4 text-2xl font-semibold text-slate-900">Transcript</h2>
              <div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-white/40 bg-white/70 p-4 text-sm text-slate-700 shadow-inner">
                <p className="whitespace-pre-wrap leading-relaxed">{podcast.content}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </StudyCastAppShell>
  );
};

export default Listen;
